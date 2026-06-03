import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;  // allow up to 2 min for video upload + processing

// Tell Next.js not to parse the body itself — we handle formData streaming
export const dynamic = "force-dynamic";

const GEMINI_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;
const FILE_UPLOAD_URL = `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${GEMINI_KEY}`;

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;  // 20 MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;  // 50 MB

const PROMPTS: Record<string, string> = {
  analytics_daily: `Extract TikTok analytics metrics from this screenshot. Return ONLY a JSON object, no markdown, no explanation:
{"date":"label shown e.g. May 2","gmv":1234.56,"items":42,"commission":98.76,"impressions":12400,"clicks":820}
Use 0 for any metric not visible.`,

  analytics_products: `Extract the product performance table from this TikTok screenshot. Return ONLY a JSON array, no markdown:
[{"name":"Product Name","gmv":4200,"items":84,"commission":336}]
Include every visible product row.`,

  orders: `Extract all order rows from this TikTok Shop screenshot or video. Return ONLY a JSON array, no markdown:
[{"id":"ORDER_ID","product":"Product Name","date":"YYYY-MM-DD","gmv":42.00,"commission":3.36,"status":"Paid"}]
Status must be one of: Paid, Missing, Returned/Canceled, Flag. For videos, analyze all frames and extract every order visible across the entire recording. Extract every visible row.`,

  earnings: `Extract earnings/revenue entries from this TikTok Shop screenshot. Return ONLY a JSON array, no markdown:
[{"date":"YYYY-MM-DD","amount":0,"type":"Daily Revenue","notes":""}]
Type must be one of: Daily Revenue, Flat Fee, Rewards. Default to "Daily Revenue" if unclear. Extract every visible row. Use empty string for notes if not visible.`,

  samples: `You are analyzing a screenshot or screen recording of product samples (TikTok DM, email, brand portal, or any screen recording).
Extract ALL visible product sample details. Return ONLY a JSON array, no markdown:
[{"product":"Full product name","collab":"Brand or company name or empty string","receivedDate":"YYYY-MM-DD or empty string","dueDate":"YYYY-MM-DD or empty string","notes":"content requirements, deadlines, or other details or empty string"}]
For videos, analyze all frames and extract every product sample visible across the entire recording — including content that appears as the user scrolls. If only one product is visible, return a single-element array. Convert all dates to YYYY-MM-DD format. Use empty string for any field not visible.`,
};

// ── Gemini File API: upload video, poll for ACTIVE, return fileUri ─────────────
async function uploadVideoAndWait(bytes: ArrayBuffer, mime: string, displayName: string): Promise<string> {
  const buf  = Buffer.from(bytes);
  const size = buf.length;

  // 1. Initiate resumable upload
  const startRes = await fetch(FILE_UPLOAD_URL, {
    method: "POST",
    headers: {
      "X-Goog-Upload-Protocol":              "resumable",
      "X-Goog-Upload-Command":               "start",
      "X-Goog-Upload-Header-Content-Length": String(size),
      "X-Goog-Upload-Header-Content-Type":   mime,
      "Content-Type":                        "application/json",
    },
    body: JSON.stringify({ file: { display_name: displayName } }),
  });

  if (!startRes.ok) {
    const err = await startRes.json().catch(() => null);
    const msg = err?.error?.message || `Upload initiation failed (HTTP ${startRes.status})`;
    throw new Error(msg);
  }

  const uploadUrl = startRes.headers.get("x-goog-upload-url");
  if (!uploadUrl) throw new Error("Gemini did not return an upload URL. Check your GEMINI_API_KEY.");

  // 2. Upload all bytes in a single chunk and finalize
  const uploadRes = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Length":        String(size),
      "X-Goog-Upload-Offset":  "0",
      "X-Goog-Upload-Command": "upload, finalize",
    },
    body: buf,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => null);
    const msg = err?.error?.message || `File upload failed (HTTP ${uploadRes.status})`;
    throw new Error(msg);
  }

  const fileData = await uploadRes.json();
  const fileUri  = (fileData.file?.uri)  as string | undefined;
  const fileName = (fileData.file?.name) as string | undefined;

  if (!fileUri || !fileName) {
    console.error("[ocr] unexpected upload response:", JSON.stringify(fileData));
    throw new Error("Gemini did not return a file URI. The upload may have failed silently.");
  }

  // 3. Check state immediately — short clips may already be ACTIVE
  const FILE_STATUS_URL = `https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${GEMINI_KEY}`;

  function parseState(body: any): string | undefined {
    // GET /v1beta/files/{name} returns the file object directly
    // but guard against both shapes just in case
    return (body?.state ?? body?.file?.state) as string | undefined;
  }

  const initialState = parseState(fileData.file ?? fileData);
  if (initialState === "ACTIVE")  return fileUri;
  if (initialState === "FAILED")  throw new Error("Gemini failed to process the video immediately after upload.");

  // 4. Poll every 2 s until ACTIVE or FAILED (max 60 s)
  const MAX_POLLS = 30;
  const POLL_MS   = 2_000;

  for (let i = 0; i < MAX_POLLS; i++) {
    await new Promise(r => setTimeout(r, POLL_MS));

    const statusRes = await fetch(FILE_STATUS_URL);
    if (!statusRes.ok) {
      // Non-fatal — retry on next tick
      console.warn(`[ocr] file status check failed (attempt ${i + 1}):`, statusRes.status);
      continue;
    }

    const statusBody = await statusRes.json();
    const state = parseState(statusBody);

    if (state === "ACTIVE") return fileUri;
    if (state === "FAILED") throw new Error(
      "Gemini failed to process the video. Try a different format (MP4/MOV recommended) or a shorter clip."
    );
    // state === "PROCESSING" → keep polling
  }

  throw new Error("Video processing timed out after 60 s. Try a shorter clip (under 60 seconds).");
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("image") as File | null;   // field name kept for backwards compat
    const type = form.get("type")  as string | null;

    if (!file || !type) {
      return NextResponse.json({ error: "Missing file or type." }, { status: 400 });
    }

    const prompt = PROMPTS[type];
    if (!prompt) {
      return NextResponse.json({ error: "Invalid type." }, { status: 400 });
    }

    const mime    = file.type || "application/octet-stream";
    const isVideo = mime.startsWith("video/");
    const bytes   = await file.arrayBuffer();

    // ── Size guards ─────────────────────────────────────────────────────────
    if (isVideo && bytes.byteLength > MAX_VIDEO_BYTES) {
      const mb = (bytes.byteLength / 1024 / 1024).toFixed(0);
      return NextResponse.json(
        { error: `Video is too large (${mb} MB). Maximum allowed is 50 MB.` },
        { status: 413 }
      );
    }
    if (!isVideo && bytes.byteLength > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "Image is too large. Maximum allowed is 20 MB." },
        { status: 413 }
      );
    }

    // ── Build Gemini request (video path vs image path) ──────────────────────
    let contentParts: object[];

    if (isVideo) {
      let fileUri: string;
      try {
        fileUri = await uploadVideoAndWait(bytes, mime, file.name || "video");
      } catch (uploadErr: any) {
        console.error("[ocr] video upload error:", uploadErr);
        return NextResponse.json({ error: uploadErr.message ?? "Video upload failed." }, { status: 502 });
      }
      contentParts = [
        { text: prompt },
        { file_data: { mime_type: mime, file_uri: fileUri } },
      ];
    } else {
      const base64 = Buffer.from(bytes).toString("base64");
      contentParts = [
        { text: prompt },
        { inline_data: { mime_type: mime, data: base64 } },
      ];
    }

    const geminiRes = await fetch(GEMINI_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: contentParts }],
        generationConfig: { temperature: 0, topP: 1, maxOutputTokens: 4096 },
      }),
    });

    // ── Gemini error handling ────────────────────────────────────────────────
    if (!geminiRes.ok) {
      let errBody: any = null;
      try { errBody = await geminiRes.json(); } catch { /* non-JSON */ }
      console.error("[ocr] Gemini error:", JSON.stringify(errBody, null, 2));

      if (geminiRes.status === 429) {
        const retryInfo = errBody?.error?.details?.find((d: any) =>
          typeof d?.["@type"] === "string" && d["@type"].includes("RetryInfo")
        );
        const secs = retryInfo?.retryDelay ? parseInt(retryInfo.retryDelay as string, 10) : null;
        const msg  = secs
          ? `Gemini quota exceeded — retry in ${secs}s. Enable billing at ai.google.dev to remove limits.`
          : "Gemini quota exceeded. Enable billing at ai.google.dev or try again later.";
        return NextResponse.json({ error: msg }, { status: 429 });
      }

      const specificMsg = errBody?.error?.message || "Gemini API error.";
      return NextResponse.json({ error: specificMsg }, { status: 502 });
    }

    const geminiData = await geminiRes.json();

    // Gemini may return RECITATION / safety block with no candidates
    if (!geminiData.candidates?.length) {
      const reason = geminiData.promptFeedback?.blockReason;
      return NextResponse.json(
        { error: reason ? `Blocked by Gemini: ${reason}` : "Gemini returned no response." },
        { status: 422 }
      );
    }

    const rawText = geminiData.candidates[0]?.content?.parts?.[0]?.text ?? "";

    // Strip markdown fences if Gemini wraps in ```json ... ```
    const clean = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

    if (!clean) {
      return NextResponse.json({ error: "Gemini returned an empty response. Nothing was visible or readable." }, { status: 422 });
    }

    try {
      const parsed = JSON.parse(clean);
      return NextResponse.json({ data: parsed });
    } catch {
      console.error("[ocr] parse error, raw:", rawText);
      return NextResponse.json({ error: "Could not parse Gemini response.", raw: rawText }, { status: 422 });
    }
  } catch (err: any) {
    console.error("[ocr]", err);
    return NextResponse.json({ error: err.message ?? "Internal error." }, { status: 500 });
  }
}
