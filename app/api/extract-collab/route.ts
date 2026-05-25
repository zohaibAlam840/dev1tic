import { NextRequest, NextResponse } from "next/server";

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

export async function POST(req: NextRequest) {
  try {
    const { body } = await req.json();
    if (!body?.trim()) {
      return NextResponse.json({ error: "No message body provided." }, { status: 400 });
    }

    const prompt = `Extract brand collaboration details from this message. Return ONLY a JSON object, no markdown, no explanation:
{"brand":"Brand or company name","product":"Product or campaign name","value":0,"commission":0,"dueDate":"YYYY-MM-DD or empty string","contact":"Contact person name or email or empty string","collabType":"one of: TikTok Shop Affiliate, Fixed Pay, Fixed Pay + Commission, Creator Marketplace, Monthly Retainer, Product Exchange, UGC Only, Other, or empty string","deliverables":"content requirements or empty string","notes":"any other relevant details or empty string"}
Use 0 for numeric fields if not mentioned. Use empty string for any field not visible. If you cannot determine the brand, use empty string.

Message:
${body}`;

    const geminiRes = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0, topP: 1, maxOutputTokens: 1024 },
      }),
    });

    if (!geminiRes.ok) {
      const errBody = await geminiRes.json().catch(() => null);
      const msg = errBody?.error?.message || "Gemini API error.";
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const clean = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

    try {
      const parsed = JSON.parse(clean);
      return NextResponse.json({ data: parsed });
    } catch {
      console.error("[extract-collab] parse error, raw:", rawText);
      return NextResponse.json({ error: "Could not parse Gemini response.", raw: rawText }, { status: 422 });
    }
  } catch (err: any) {
    console.error("[extract-collab]", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
