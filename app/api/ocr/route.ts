import { NextRequest, NextResponse } from "next/server";

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

const PROMPTS: Record<string, string> = {
  analytics_daily: `Extract TikTok analytics metrics from this screenshot. Return ONLY a JSON object, no markdown, no explanation:
{"date":"label shown e.g. May 2","gmv":1234.56,"items":42,"commission":98.76,"impressions":12400,"clicks":820}
Use 0 for any metric not visible.`,

  analytics_products: `Extract the product performance table from this TikTok screenshot. Return ONLY a JSON array, no markdown:
[{"name":"Product Name","gmv":4200,"items":84,"commission":336}]
Include every visible product row.`,

  orders: `Extract all order rows from this TikTok Shop screenshot. Return ONLY a JSON array, no markdown:
[{"id":"ORDER_ID","product":"Product Name","date":"YYYY-MM-DD","gmv":42.00,"commission":3.36,"status":"Paid"}]
Status must be one of: Paid, Missing, Returned/Canceled, Flag. Extract every visible row.`,

  samples: `Extract product sample details from this screenshot (TikTok message, email, or brand portal page). Return ONLY a JSON object, no markdown:
{"product":"Full product name","collab":"Brand or company name or empty string","receivedDate":"YYYY-MM-DD or empty string","dueDate":"YYYY-MM-DD or empty string","notes":"content requirements, deadlines, or other details or empty string"}
Convert all dates to YYYY-MM-DD format. Use empty string for any field not visible.`,
};

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("image") as File | null;
    const type = form.get("type") as string | null;

    if (!file || !type) {
      return NextResponse.json({ error: "Missing image or type." }, { status: 400 });
    }
    const prompt = PROMPTS[type];
    if (!prompt) {
      return NextResponse.json({ error: "Invalid type." }, { status: 400 });
    }

    const bytes  = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mime   = file.type || "image/jpeg";

    const geminiRes = await fetch(GEMINI_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: mime, data: base64 } },
          ],
        }],
        generationConfig: { temperature: 0, topP: 1, maxOutputTokens: 4096 },
      }),
    });

    if (!geminiRes.ok) {
      let errBody: any = null;
      try { errBody = await geminiRes.json(); } catch { /* non-JSON error body */ }
      console.error("[ocr] Gemini error:", JSON.stringify(errBody, null, 2));

      if (geminiRes.status === 429) {
        const retryInfo = errBody?.error?.details?.find((d: any) =>
          typeof d?.["@type"] === "string" && d["@type"].includes("RetryInfo")
        );
        const secs = retryInfo?.retryDelay ? parseInt(retryInfo.retryDelay as string, 10) : null;
        const msg  = secs
          ? `Gemini quota exceeded — retry in ${secs}s. To remove limits enable billing at ai.google.dev.`
          : "Gemini quota exceeded. Enable billing at ai.google.dev or try again later.";
        return NextResponse.json({ error: msg }, { status: 429 });
      }

      const specificMsg = errBody?.error?.message || "Gemini API error.";
      return NextResponse.json({ error: specificMsg }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const rawText    = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Strip markdown fences if Gemini wraps in ```json ... ```
    const clean = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

    try {
      const parsed = JSON.parse(clean);
      return NextResponse.json({ data: parsed });
    } catch {
      console.error("[ocr] parse error, raw:", rawText);
      return NextResponse.json({ error: "Could not parse Gemini response.", raw: rawText }, { status: 422 });
    }
  } catch (err: any) {
    console.error("[ocr]", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
