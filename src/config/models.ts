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
    id: 'qwen/qwen2.5-vl-72b-instruct:free',
    name: 'Qwen 2.5 VL 72B (Free)',
    description: 'Advanced vision model - analyzes charts, diagrams, text in images',
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
    id: 'google/gemini-flash-1.5',
    name: 'Gemini Flash 1.5 (Paid)',
    description: 'Fast, optimized for multimodal tasks',
    free: false,
    supportsVision: true,
  },
  {
    id: 'google/gemini-pro-1.5',
    name: 'Gemini Pro 1.5 (Paid)',
    description: 'High-quality multimodal model for complex tasks',
    free: false,
    supportsVision: true,
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet (Paid)',
    description: 'Excellent for detailed image analysis and reasoning',
    free: false,
    supportsVision: true,
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o (Paid)',
    description: 'OpenAI\'s multimodal model with strong vision capabilities',
    free: false,
    supportsVision: true,
  },
];

export const DEFAULT_MODEL = 'google/gemini-2.0-flash-exp:free';
