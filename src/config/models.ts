export interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  free: boolean;
  supportsVision: boolean;
}

export const OPENROUTER_MODELS: OpenRouterModel[] = [
  {
    id: 'google/gemma-3-4b-it',
    name: 'Gemma 3 4B (Free)',
    description: 'Google\'s free multimodal model - supports text and images',
    free: true,
    supportsVision: true,
  },
  {
    id: 'google/gemma-3-12b-it',
    name: 'Gemma 3 12B (Free)',
    description: 'Larger free model with better vision understanding',
    free: true,
    supportsVision: true,
  },
  {
    id: 'google/gemma-3-27b-it',
    name: 'Gemma 3 27B (Free)',
    description: 'Most capable free model - excellent for complex slides',
    free: true,
    supportsVision: true,
  },
  {
    id: 'allenai/molmo-2-8b',
    name: 'Molmo 2 8B (Free)',
    description: 'Open vision-language model supporting images and video',
    free: true,
    supportsVision: true,
  },
  {
    id: 'meta-llama/llama-3.2-11b-vision-instruct',
    name: 'Llama 3.2 11B Vision (Very Low Cost)',
    description: 'Nearly free - excellent vision capabilities (~$0.00005/request)',
    free: false,
    supportsVision: true,
  },
  {
    id: 'qwen/qwen-2.5-vl-7b-instruct',
    name: 'Qwen 2.5 VL 7B (Very Low Cost)',
    description: 'Great for charts and diagrams (~$0.0002/request)',
    free: false,
    supportsVision: true,
  },
  {
    id: 'google/gemini-flash-1.5',
    name: 'Gemini Flash 1.5 (Paid)',
    description: 'Fast and reliable - Google\'s production model',
    free: false,
    supportsVision: true,
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet (Paid)',
    description: 'Premium quality for detailed analysis',
    free: false,
    supportsVision: true,
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o (Paid)',
    description: 'OpenAI\'s powerful multimodal model',
    free: false,
    supportsVision: true,
  },
];

export const DEFAULT_MODEL = 'google/gemma-3-12b-it';
