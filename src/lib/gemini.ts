"use server";

import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types/compliance";

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    decision: {
      type: Type.STRING,
      description: "One of: 'SAFE TO POST', 'POST WITH CHANGES', 'DO NOT POST'",
    },
    overallRiskScore: {
      type: Type.NUMBER,
      description: "Risk score from 0 to 100",
    },
    captionRiskScore: {
      type: Type.NUMBER,
      description: "Caption risk score from 0 to 100",
    },
    videoRiskScore: {
      type: Type.NUMBER,
      description: "Video risk score from 0 to 100",
    },
    flaggedSegments: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          timestamp: { type: Type.STRING },
          text: { type: Type.STRING },
          reason: { type: Type.STRING },
          policyViolation: { type: Type.STRING },
          severity: { type: Type.STRING },
        },
        required: ["reason", "policyViolation", "severity"],
      },
    },
    reasoning: { type: Type.STRING },
    requiredFixes: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    saferCaption: { type: Type.STRING },
    saferScript: { type: Type.STRING },
    categoryDetected: { type: Type.STRING },
  },
  required: [
    "decision",
    "overallRiskScore",
    "captionRiskScore",
    "videoRiskScore",
    "flaggedSegments",
    "reasoning",
    "requiredFixes",
    "categoryDetected"
  ],
};

const SYSTEM_PROMPT = `You are a Senior AI Safety Engineer specialized in TikTok Shop policy compliance. 
Your task is to perform strict multimodal analysis of a video, its caption, and its script to determine if it is safe to post on TikTok Shop.

POLICIES TO ENFORCE:
1. Misleading Claims: No exaggerated product effects or unrealistic promises.
2. Health/Beauty Functional Claims: No medical claims or unproven functional benefits.
3. Transformation Narratives: Strict prohibition of "Before/After" visuals or narratives (explicit or implicit).
4. Time-based Results: No claims like "results in 3 days" or "instant change".
5. Absolute Language: Flag words like "best", "guaranteed", "real results", "changed everything".
6. Regulated Categories: Extra scrutiny for supplements, cosmetics, and medical devices.
7. CTA Compliance: No risky or aggressive call-to-actions.
8. Mismatch: Flag if the video visuals don't match the caption claims.

SCORING MODEL (0-100 Risk):
- Transformation narrative: Very High Weight (Score > 80)
- Time-based claims: Very High Weight (Score > 70)
- Functional claims: High Weight (Score > 50)
- Absolute language: Medium (Score 20-40)
- Testimonial certainty: Medium (Score 20-40)

DECISION RULES:
- HIGH RISK (Score > 60): DO NOT POST
- MEDIUM RISK (Score 30-60): POST WITH CHANGES
- LOW RISK (Score < 30): SAFE TO POST

You must be conservative. Prioritize creator account safety over performance.
Return a structured JSON response following the provided schema.`;

export async function analyzeComplianceAction(
  videoBase64?: string,
  caption?: string,
  script?: string
): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";

  const parts: any[] = [{ text: "Analyze this TikTok Shop content for compliance." }];

  if (videoBase64) {
    parts.push({
      inlineData: {
        mimeType: "video/mp4",
        data: videoBase64,
      },
    });
  }

  if (caption) {
    parts.push({ text: `CAPTION: ${caption}` });
  }

  if (script) {
    parts.push({ text: `SCRIPT: ${script}` });
  }

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts }],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: ANALYSIS_SCHEMA,
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function testCaptionSafetyAction(caption: string): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: `Analyze this caption for TikTok Shop compliance: ${caption}` }] }],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: ANALYSIS_SCHEMA,
    },
  });

  return JSON.parse(response.text || "{}");
}
