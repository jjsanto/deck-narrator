export interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  free: boolean;
  supportsVision: boolean;
}

export const OPENROUTER_MODELS: OpenRouterModel[] = [
  {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'Gemini 2.0 Flash (Free)',
    description: 'Fast, free vision model from Google',
    free: true,
    supportsVision: true,
  },
  {
    id: 'google/gemini-flash-1.5',
    name: 'Gemini Flash 1.5',
    description: 'Fast vision model from Google',
    free: false,
    supportsVision: true,
  },
  {
    id: 'meta-llama/llama-3.2-11b-vision-instruct:free',
    name: 'Llama 3.2 11B Vision (Free)',
    description: 'Free vision model from Meta',
    free: true,
    supportsVision: true,
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: 'Premium vision model with excellent analysis',
    free: false,
    supportsVision: true,
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    description: 'Premium vision model from OpenAI',
    free: false,
    supportsVision: true,
  },
  {
    id: 'google/gemini-pro-1.5',
    name: 'Gemini Pro 1.5',
    description: 'High-quality vision model from Google',
    free: false,
    supportsVision: true,
  },
];

export const DEFAULT_MODEL = 'google/gemini-2.0-flash-exp:free';
