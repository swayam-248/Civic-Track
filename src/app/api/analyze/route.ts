import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import path from "path";
import { readFile } from "fs/promises";
import sharp from "sharp";

async function analyzeWithGemini(apiKey: string, base64Image: string, mimeType: string) {
  const models = ["gemini-1.5-flash", "gemini-2.0-flash"];
  let lastError: string | null = null;

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
    const prompt = `You are an expert civic infrastructure inspection AI. Analyze this image carefully to detect civic problems.
Available categories strictly:
- pothole: Road damage, potholes, asphalt cracks, road surface hazards
- garbage: Overflowing trash bins, illegal waste dumping, litter, waste piles
- water-leakage: Water pipe bursts, flooding, seepage, drainage leaks, standing water
- streetlight: Broken, unlit, damaged street lights, lamp post failures
- electric-pole: Leaning, damaged, or fallen electric poles, loose power lines
- other: Any other civic infrastructure issue

Respond ONLY with a raw valid JSON object (no markdown, no extra text):
{
  "categoryId": "pothole" | "garbage" | "water-leakage" | "streetlight" | "electric-pole" | "other",
  "confidence": <number between 65 and 99>,
  "reasoning": "<1-2 sentences describing specific visual features in the photo that support this classification>"
}`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Image,
                  },
                },
                { text: prompt },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1,
          },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        lastError = `Gemini API (${model}) returned HTTP ${res.status}: ${errText}`;
        continue;
      }

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const cleanedText = rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
      const parsed = JSON.parse(cleanedText);
      return {
        categoryId: parsed.categoryId,
        confidence: Math.max(50, Math.min(99, Number(parsed.confidence) || 88)),
        reasoning: String(parsed.reasoning || "Gemini Vision model detected civic issue in photo."),
        model: `Google ${model} Vision`,
      };
    } catch (err: any) {
      lastError = err.message || String(err);
    }
  }

  throw new Error(lastError || "Gemini Vision API failed");
}

async function analyzeWithOpenAI(apiKey: string, base64Image: string, mimeType: string) {
  const url = "https://api.openai.com/v1/chat/completions";
  const prompt = `You are an expert civic infrastructure inspection AI. Analyze this image carefully to detect civic problems.
Available categories strictly:
- pothole: Road damage, potholes, asphalt cracks
- garbage: Overflowing trash bins, illegal waste dumping, litter
- water-leakage: Water pipe bursts, flooding, seepage, drainage leaks
- streetlight: Broken, unlit, damaged street lights
- electric-pole: Leaning, damaged, or fallen electric poles
- other: Any other civic infrastructure issue

Respond ONLY with a raw valid JSON object:
{
  "categoryId": "pothole" | "garbage" | "water-leakage" | "streetlight" | "electric-pole" | "other",
  "confidence": <number between 65 and 99>,
  "reasoning": "<1-2 sentences describing specific visual features in the photo that support this classification>"
}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${base64Image}` },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const rawText = data?.choices?.[0]?.message?.content || "";
  const parsed = JSON.parse(rawText);
  return {
    categoryId: parsed.categoryId,
    confidence: Math.max(50, Math.min(99, Number(parsed.confidence) || 88)),
    reasoning: String(parsed.reasoning || "OpenAI Vision model detected civic issue in photo."),
    model: "OpenAI GPT-4o-mini Vision",
  };
}

async function analyzeWithOpenRouter(apiKey: string, base64Image: string, mimeType: string) {
  const url = "https://openrouter.ai/api/v1/chat/completions";
  const models = [
    "google/gemini-flash-1.5:free",
    "meta-llama/llama-3.2-11b-vision-instruct:free",
    "qwen/qwen-2.5-vl-72b-instruct:free",
    "openai/gpt-4o-mini"
  ];
  let lastErr: string | null = null;

  for (const model of models) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey.trim()}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "CivicTrack",
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `You are an expert civic infrastructure inspection AI. Analyze this image carefully to detect civic problems.
Available categories strictly:
- pothole: Road damage, potholes, asphalt cracks, road surface hazards
- garbage: Overflowing trash bins, illegal waste dumping, litter, waste piles
- water-leakage: Water pipe bursts, flooding, seepage, drainage leaks, standing water
- streetlight: Broken, unlit, damaged street lights, lamp post failures
- electric-pole: Leaning, damaged, or fallen electric poles, loose power lines
- other: Any other civic infrastructure issue

Respond ONLY with a raw valid JSON object:
{
  "categoryId": "pothole" | "garbage" | "water-leakage" | "streetlight" | "electric-pole" | "other",
  "confidence": <number between 65 and 99>,
  "reasoning": "<1-2 sentences describing specific visual features in the photo that support this classification>"
}`,
                },
                {
                  type: "image_url",
                  image_url: { url: `data:${mimeType};base64,${base64Image}` },
                },
              ],
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
        }),
      });

      if (!res.ok) {
        lastErr = await res.text();
        continue;
      }

      const data = await res.json();
      const rawText = data?.choices?.[0]?.message?.content || "";
      const cleanedText = rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
      const parsed = JSON.parse(cleanedText);
      return {
        categoryId: parsed.categoryId,
        confidence: Math.max(50, Math.min(99, Number(parsed.confidence) || 88)),
        reasoning: String(parsed.reasoning || "OpenRouter Vision model detected civic issue in photo."),
        model: `OpenRouter (${model})`,
      };
    } catch (e: any) {
      lastErr = e.message || String(e);
    }
  }

  throw new Error(`OpenRouter API error: ${lastErr || "Failed"}`);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { categoryId: userSelectedCategory, imageUrl } = await req.json();

  let targetCategoryId = userSelectedCategory || "pothole";
  let confidence = 75;
  let reasoning = "Baseline analysis performed for selected category.";
  let method = "heuristic-pixel-analysis";
  let modelName = "";
  let apiErrorMessage = "";

  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const openAIKey = process.env.OPENAI_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  const effOpenRouterKey =
    openRouterKey ||
    (openAIKey?.startsWith("sk-or-v1-") ? openAIKey : undefined) ||
    (geminiKey?.startsWith("sk-or-v1-") ? geminiKey : undefined);

  if (imageUrl) {
    try {
      const filePath = path.join(process.cwd(), "public", imageUrl.replace(/^\//, ""));
      const buffer = await readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const mimeType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
      const base64Image = buffer.toString("base64");

      // 1. Try OpenRouter Vision if an OpenRouter key is provided
      if (effOpenRouterKey && effOpenRouterKey.trim().length > 0) {
        try {
          const llmResult = await analyzeWithOpenRouter(effOpenRouterKey, base64Image, mimeType);
          targetCategoryId = llmResult.categoryId || targetCategoryId;
          confidence = llmResult.confidence;
          reasoning = llmResult.reasoning;
          method = "llm-vision-analysis";
          modelName = llmResult.model;
        } catch (llmErr: any) {
          console.error("OpenRouter Vision API error:", llmErr);
          apiErrorMessage = `OpenRouter API Error: ${llmErr.message || llmErr}`;
        }
      }

      // 2. Try Gemini Vision if Gemini key starts with AIza
      if (method !== "llm-vision-analysis" && geminiKey && geminiKey.trim().length > 0 && geminiKey.trim().startsWith("AIza")) {
        try {
          const llmResult = await analyzeWithGemini(geminiKey, base64Image, mimeType);
          targetCategoryId = llmResult.categoryId || targetCategoryId;
          confidence = llmResult.confidence;
          reasoning = llmResult.reasoning;
          method = "llm-vision-analysis";
          modelName = llmResult.model;
        } catch (llmErr: any) {
          console.error("Gemini Vision API error:", llmErr);
          apiErrorMessage = `Gemini API Error: ${llmErr.message || llmErr}`;
        }
      }

      // 3. Try OpenAI Vision if OPENAI_API_KEY starting with sk- (not sk-or-v1-) is configured
      if (method !== "llm-vision-analysis" && openAIKey && openAIKey.trim().length > 0 && !openAIKey.startsWith("sk-or-v1-")) {
        try {
          const llmResult = await analyzeWithOpenAI(openAIKey, base64Image, mimeType);
          targetCategoryId = llmResult.categoryId || targetCategoryId;
          confidence = llmResult.confidence;
          reasoning = llmResult.reasoning;
          method = "llm-vision-analysis";
          modelName = llmResult.model;
        } catch (llmErr: any) {
          console.error("OpenAI Vision API error:", llmErr);
          apiErrorMessage = `OpenAI API Error: ${llmErr.message || llmErr}`;
        }
      }

      // 4. Fallback to pixel sharp statistical metrics if no LLM succeeded
      if (method !== "llm-vision-analysis") {
        const image = sharp(buffer);
        const metadata = await image.metadata();
        const stats = await image.stats();

        const megapixels = ((metadata.width || 0) * (metadata.height || 0)) / 1_000_000;
        const resolutionScore = Math.min(megapixels / 2, 1) * 10;

        const avgStdDev =
          stats.channels.reduce((sum, c) => sum + c.stdev, 0) / stats.channels.length;
        const sharpnessScore = Math.min(avgStdDev / 60, 1) * 10;

        const avgMean = stats.channels.reduce((sum, c) => sum + c.mean, 0) / stats.channels.length;
        const isReasonablyLit = avgMean > 30 && avgMean < 225;
        const lightingScore = isReasonablyLit ? 5 : -10;

        confidence = Math.round(70 + resolutionScore + sharpnessScore + lightingScore);
        confidence = Math.max(40, Math.min(99, confidence));
        
        if (apiErrorMessage) {
          reasoning = `${apiErrorMessage}. (Falling back to pixel analysis on ${metadata.width}x${metadata.height}px photo). Please check OPENROUTER_API_KEY in .env.`;
        } else {
          reasoning = `Analyzed ${metadata.width}x${metadata.height}px photo (${megapixels.toFixed(1)}MP). Contrast: ${avgStdDev.toFixed(1)}, brightness mean: ${avgMean.toFixed(1)}.`;
        }
        method = "pixel-heuristic-analysis";
      }
    } catch (err) {
      console.error("Image file reading/analysis failed:", err);
    }
  }

  // Retrieve category and department from database
  let category = await db.category.findUnique({
    where: { id: targetCategoryId },
    include: { department: true },
  });

  if (!category) {
    category = await db.category.findUnique({
      where: { id: userSelectedCategory || "pothole" },
      include: { department: true },
    }) || await db.category.findFirst({ include: { department: true } });
  }

  if (!category) {
    return NextResponse.json({ error: "Category not found in database" }, { status: 400 });
  }

  return NextResponse.json({
    categoryId: category.id,
    category: category.name,
    department: category.department?.name || "General",
    icon: (category as any).icon || "alert-circle",
    confidence,
    reasoning,
    method,
    model: modelName,
  });
}
