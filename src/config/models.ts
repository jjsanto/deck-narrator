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
    name: 'Gemini 2.0 Flash Exp (Free)',
    description: 'Fast multimodal model with vision - completely free',
    free: true,
    supportsVision: true,
  },
  {
    id: 'meta-llama/llama-3.2-11b-vision-instruct:free',
    name: 'Llama 3.2 11B Vision (Free)',
    description: 'Meta\'s free vision model for image understanding',
    free: true,
    supportsVision: true,
  },
  {
    id: 'google/gemini-flash-1.5-8b',
    name: 'Gemini Flash 1.5 8B (Low Cost)',
    description: 'Fast and affordable - optimized for speed',
    free: false,
    supportsVision: true,
  },
  {
    id: 'google/gemini-flash-1.5',
    name: 'Gemini Flash 1.5',
    description: 'Balanced speed and quality for multimodal tasks',
    free: false,
    supportsVision: true,
  },
  {
    id: 'google/gemini-pro-1.5',
    name: 'Gemini Pro 1.5',
    description: 'High-quality for complex image analysis',
    free: false,
    supportsVision: true,
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: 'Excellent for detailed reasoning and analysis',
    free: false,
    supportsVision: true,
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    description: 'OpenAI\'s multimodal model',
    free: false,
    supportsVision: true,
  },
];

export const DEFAULT_MODEL = 'google/gemini-2.0-flash-exp:free';
