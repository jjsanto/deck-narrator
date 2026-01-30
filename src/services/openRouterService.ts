import { API_CONFIG, VISION_PROMPT } from '../config/api';
import type { APIError } from '../types';

export class OpenRouterService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateScript(imageDataUrl: string, model: string): Promise<string> {
    try {
      const response = await fetch(API_CONFIG.openRouter.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Deck Narrator',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: VISION_PROMPT,
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageDataUrl,
                  },
                },
              ],
            },
          ],
          max_tokens: API_CONFIG.openRouter.maxTokens,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw this.createError(
          `OpenRouter API error: ${response.status} ${response.statusText}`,
          error
        );
      }

      const data = await response.json();
      const script = data.choices?.[0]?.message?.content?.trim() || '';

      if (!script) {
        console.error('OpenRouter returned empty script:', data);
        throw this.createError('Generated script is empty', data);
      }

      return script;
    } catch (error) {
      if (error instanceof Error && error.message.includes('OpenRouter')) {
        throw error;
      }
      throw this.createError('Failed to generate script', error);
    }
  }

  private createError(message: string, details?: unknown): APIError {
    return {
      message,
      details,
    } as APIError;
  }
}
