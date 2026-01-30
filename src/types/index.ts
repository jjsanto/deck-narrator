export interface Slide {
  id: string;
  pageNumber: number;
  imageDataUrl: string;
  script: string;
  wordCount: number;
  charCount: number;
  audioBuffer?: AudioBuffer;
  audioDuration?: number;
}

export type TTSProvider = 'lemonfox' | 'webspeech' | 'edgetts';

export interface ProjectState {
  pdfFile: File | null;
  selectedVoiceId: string;
  ttsProvider: TTSProvider;
  selectedModel: string;
  slides: Slide[];
  finalVideoBlob: Blob | null;
  apiKeys: {
    openRouter: string;
    lemonfox: string;
  };
}

export type WorkflowStage = 'upload' | 'review' | 'generate' | 'download';

export interface VideoGenerationProgress {
  stage: 'tts' | 'rendering' | 'encoding' | 'complete';
  currentSlide: number;
  totalSlides: number;
  percentage: number;
  message: string;
}

export interface APIError {
  message: string;
  code?: string;
  details?: unknown;
}
