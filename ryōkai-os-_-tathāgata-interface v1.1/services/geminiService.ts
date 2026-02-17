
import { GoogleGenAI } from "@google/genai";
import type { AiContent, UpayaStyle, GroundingSource } from "../types";
import { SUPERVISOR_PROMPT_TEMPLATE } from "../constants";

let globalApiKey = "";
export const setServiceApiKey = (key: string) => {
  globalApiKey = key;
};

const getAI = () => new GoogleGenAI({ apiKey: globalApiKey || '' });

const MAX_RETRIES = 2;
const INITIAL_DELAY_MS = 1000;

export interface GatewayRequest {
  prompt: string;
  personaSummary: string;
  awakeningStage: string;
  upayaStyle: UpayaStyle;
  fileData?: { mimeType: string, data: string };
  isAwakened?: boolean;
  isHighSpeed?: boolean;
}

export interface GatewayResponse {
  analysis: string;
  chosenEngine: 'GARBHA' | 'VAJRA' | 'VIDEO' | 'IMAGE';
  responseToUser: string;
  echoText?: string;
  readerNotes?: string;
  coCreationPrompt?: string;
  personaUpdate: string | null;
  stageUpdate: string | null;
  groundingSources?: GroundingSource[];
}

/**
 * Strips bold markers, code fences, and accidental surrounding Japanese brackets.
 */
function sanitizeOutput(text: string): string {
  if (!text) return "";
  let clean = text.trim();

  // Remove markdown code fences aggressively
  clean = clean.replace(/^```[a-z]*\s*/gi, '').replace(/\s*```$/gi, '');
  clean = clean.replace(/^```/gi, '').replace(/```$/gi, '');

  let changed = true;
  while (changed) {
    const prev = clean;
    if (clean.startsWith('「') && clean.endsWith('」')) {
      clean = clean.substring(1, clean.length - 1).trim();
    }
    if (clean.startsWith('『') && clean.endsWith('』')) {
      clean = clean.substring(1, clean.length - 1).trim();
    }
    clean = clean.replace(/^```[a-z]*\s*/gi, '').replace(/\s*```$/gi, '');
    changed = prev !== clean;
  }

  return clean
    .replace(/\*\*([「『])(.*?)([」』])\*\*/g, '$1$2$3')
    .replace(/\*\*([「『])(.*?)\*\*/g, '$1$2')
    .replace(/\*\*(.*?)([」』])\*\*/g, '$1$2')
    .trim();
}

/**
 * Robustly extract JSON from a potentially messy model response.
 */
function extractJsonResilient(text: string): any {
  if (!text) return null;
  let cleanText = text.trim();

  if (cleanText.startsWith('「') || cleanText.startsWith('『')) {
    cleanText = sanitizeOutput(cleanText);
  }

  const firstOpen = cleanText.indexOf('{');
  const lastClose = cleanText.lastIndexOf('}');

  if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
    const candidate = cleanText.substring(firstOpen, lastClose + 1);
    try {
      let parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch (e) {
      try {
        const stripped = candidate.replace(/\\n/g, ' ').replace(/\\"/g, '"').replace(/\n/g, ' ');
        return JSON.parse(stripped);
      } catch (e2) { }
    }
  }
  return null;
}

export const callDharmicGateway = async (request: GatewayRequest): Promise<GatewayResponse> => {
  const ai = getAI();
  const personaContext = request.personaSummary || "Unknown but Buddha-natured.";
  const systemInstruction = (request.isAwakened ? "AWAKENED MODE. " : "") +
    SUPERVISOR_PROMPT_TEMPLATE
      .replace('{PERSONA_CONTEXT}', personaContext)
      .replace('{AWAKENING_STAGE}', request.awakeningStage || "1")
      .replace('{UPAYA_STYLE}', request.upayaStyle)
      .replace('{USER_PROMPT}', request.prompt) +
    "\n\nIMPORTANT: OUTPUT VALID RAW JSON ONLY. DO NOT WRAP JSON IN ANY BRACKETS LIKE 「 」 OR 『 』. NO MARKDOWN FENCES.";

  const contents: AiContent = [{ parts: [{ text: systemInstruction }] }];
  if (request.fileData) {
    contents[0].parts.push({
      inlineData: { mimeType: request.fileData.mimeType, data: request.fileData.data }
    });
  }

  let lastError: any = null;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: contents,
      });

      const text = response.text || "";
      let parsed = extractJsonResilient(text);

      if (!parsed || !parsed.responseToUser) {
        return {
          analysis: "形式再編...",
          chosenEngine: 'GARBHA',
          responseToUser: sanitizeOutput(text) || "顕現の形を整えています。慈悲は届いています。",
          personaUpdate: null,
          stageUpdate: null,
          echoText: "共鳴する響き...",
          readerNotes: "法界からの直接のメッセージです。"
        };
      }

      parsed.responseToUser = sanitizeOutput(parsed.responseToUser);
      parsed.echoText = sanitizeOutput(parsed.echoText || "慈愛の響きを添えて。");
      parsed.readerNotes = sanitizeOutput(parsed.readerNotes || "この対話は法界に刻まれました。");
      return parsed as GatewayResponse;
    } catch (error: any) {
      lastError = error;
      if (error?.message?.includes("401") || error?.message?.includes("403") || error?.message?.includes("API key not valid")) throw error;
      if (attempt < MAX_RETRIES - 1) {
        await new Promise(res => setTimeout(res, INITIAL_DELAY_MS * Math.pow(2, attempt)));
      }
    }
  }
  throw lastError;
};

export const getAiResponse = async (contents: string | AiContent, isHighSpeed?: boolean): Promise<string | GatewayResponse> => {
  const ai = getAI();
  const textContent = typeof contents === 'string' ? contents : (contents[0]?.parts[0] as any)?.text || "";
  const isStructured = textContent.includes('JSON') || textContent.includes('如来') || textContent.includes('Tathagata');

  try {
    const response = await ai.models.generateContent({
      model: isHighSpeed ? 'gemini-1.5-flash' : 'gemini-1.5-pro',
      contents: typeof contents === 'string' ? [{ parts: [{ text: contents }] }] : contents,
    });

    const text = response.text || "";
    if (isStructured) {
      const parsed = extractJsonResilient(text);
      if (parsed && parsed.responseToUser) {
        parsed.responseToUser = sanitizeOutput(parsed.responseToUser);
        parsed.echoText = sanitizeOutput(parsed.echoText || "共鳴する響き...");
        parsed.readerNotes = sanitizeOutput(parsed.readerNotes || "観照の助けに。");
        return parsed as GatewayResponse;
      }
    }
    return sanitizeOutput(text);
  } catch (error: any) {
    console.error("AI Step Error:", error);
    throw error;
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-exp', // Unified for fast image gen if supported, else fallback to 1.5
    contents: { parts: [{ text: prompt }] },
  });
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return part.inlineData.data;
  }
  throw new Error("Image manifestation failed");
};

export const generateVideo = async (prompt: string, image?: { imageBytes: string, mimeType: string }): Promise<string> => {
  const ai = getAI();
  let operation = await ai.models.generateVideos({
    model: 'veo-1.0-generate-preview', // Update to correct veo model
    prompt: prompt,
    image: image ? { imageBytes: image.imageBytes, mimeType: image.mimeType } : undefined,
  });
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  return downloadLink ? `${downloadLink}&key=${globalApiKey}` : "";
};
