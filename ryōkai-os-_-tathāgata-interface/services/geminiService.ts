
import { GoogleGenAI } from "@google/genai";
import type { AiContent, UpayaStyle, GroundingSource } from "../types";
import { SUPERVISOR_PROMPT_TEMPLATE } from "../constants";

let globalApiKey = "";
export const setServiceApiKey = (key: string) => {
  globalApiKey = key;
};

const getAI = () => new GoogleGenAI({ apiKey: globalApiKey || process.env.API_KEY || '' });

const MAX_RETRIES = 2;
const INITIAL_DELAY_MS = 1000;

export interface GatewayRequest {
  prompt: string;
  personaSummary: string;
  awakeningStage: string;
  upayaStyle: UpayaStyle;
  fileData?: { mimeType: string, data: string };
  isAwakened?: boolean;
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

export const callDharmicGateway = async (request: GatewayRequest): Promise<GatewayResponse> => {
  const ai = getAI();

  const personaContext = request.personaSummary || "Unknown but Buddha-natured.";
  const systemInstruction = (request.isAwakened ? "AWAKENED MODE. " : "") +
    SUPERVISOR_PROMPT_TEMPLATE
      .replace('{PERSONA_CONTEXT}', personaContext)
      .replace('{AWAKENING_STAGE}', request.awakeningStage || "1")
      .replace('{UPAYA_STYLE}', request.upayaStyle)
      .replace('{USER_PROMPT}', request.prompt) +
    "\n\nUSE GOOGLE SEARCH IF THE USER ASKS FOR LATEST NEWS, URL CONTENT, OR CURRENT EVENTS. FILTER THE SEARCH RESULTS THROUGH THE AI SUTRAS.";

  const contents: AiContent = [
    { parts: [{ text: systemInstruction }] }
  ];

  if (request.fileData) {
    contents[0].parts.push({
      inlineData: {
        mimeType: request.fileData.mimeType,
        data: request.fileData.data
      }
    });
  }

  let lastError: any = null;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: contents,
        config: {
          responseMimeType: "application/json",
          tools: [{ googleSearch: {} }]
        }
      });

      const text = response.text;
      if (!text) throw new Error("Empty response from Tathagata");

      const cleanJson = text.replace(/```json|```/g, '').trim();
      const parsed: GatewayResponse = JSON.parse(cleanJson);

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        parsed.groundingSources = chunks
          .filter(chunk => chunk.web)
          .map(chunk => ({
            title: chunk.web?.title || 'Untitled Source',
            uri: chunk.web?.uri || ''
          }));
      }

      return parsed;
    } catch (error: any) {
      lastError = error;
      // If auth error, don't retry, throw immediately
      if (error?.message?.includes("401") || error?.message?.includes("403") || error?.message?.includes("API key not valid")) {
        throw error;
      }
      if (attempt < MAX_RETRIES - 1) {
        await new Promise(res => setTimeout(res, INITIAL_DELAY_MS * Math.pow(2, attempt)));
      }
    }
  }
  throw lastError;
};

export const getAiResponse = async (contents: string | AiContent): Promise<string | GatewayResponse> => {
  const ai = getAI();

  const isStructured = typeof contents === 'string' && contents.includes('JSON format');

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: typeof contents === 'string' ? [{ parts: [{ text: contents }] }] : contents,
    config: {
      responseMimeType: isStructured ? "application/json" : undefined,
      tools: [{ googleSearch: {} }]
    }
  });

  const text = response.text || "";

  const groundingSources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter(chunk => chunk.web)
    .map(chunk => ({
      title: chunk.web?.title || 'Untitled Source',
      uri: chunk.web?.uri || ''
    })) || [];

  if (isStructured) {
    try {
      const cleanJson = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return { ...parsed, groundingSources };
    } catch (e) {
      return text;
    }
  }

  return text;
};

export const generateImage = async (prompt: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio: "1:1" } },
  });
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return part.inlineData.data;
  }
  throw new Error("Image manifestation failed");
};

export const generateVideo = async (prompt: string, image?: { imageBytes: string, mimeType: string }): Promise<string> => {
  const ai = getAI();
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    image: image ? { imageBytes: image.imageBytes, mimeType: image.mimeType } : undefined,
    config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
  });
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }
  return operation.response?.generatedVideos?.[0]?.video?.uri || "";
};
