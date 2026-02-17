

const API_BASE_URL = 'http://localhost:8000';

export interface ChatRequest {
    message: string;
    temperature?: number;
    model_type: string;
    model_id?: string;
    is_raw?: boolean;
    grok_api_key?: string;
    gemini_api_key?: string;
}

export const ChatService = {
    async sendMessage(
        text: string,
        modelType: string,
        keys: { grok?: string, gemini?: string },
        temperature: number = 0.7,
        modelId?: string,
        isRaw: boolean = false
    ): Promise<string> {
        try {
            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: text,
                    model_type: modelType,
                    model_id: modelId,
                    is_raw: isRaw,
                    temperature,
                    grok_api_key: keys.grok,
                    gemini_api_key: keys.gemini
                }),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }
            return data.response;
        } catch (error) {
            console.error('ChatService Error:', error);
            throw error;
        }
    },

    async summarize(historyText: string, keys: { grok?: string, gemini?: string }): Promise<string> {
        try {
            const response = await fetch(`${API_BASE_URL}/summarize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: historyText,
                    model_type: 'Grok',
                    grok_api_key: keys.grok,
                    gemini_api_key: keys.gemini
                }),
            });

            const data = await response.json();
            return data.summary || 'Summary Error';
        } catch (error) {
            console.error('Summarize Error:', error);
            return 'Synthesis failed.';
        }
    }
};
