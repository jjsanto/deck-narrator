/**
 * Edge TTS Service - Free Microsoft Edge TTS
 * Uses Microsoft Edge's online text-to-speech service
 * No API key required, completely free
 */

// @ts-ignore - edge-tts-universal doesn't have TypeScript types
import { EdgeTTS } from 'edge-tts-universal/browser';

export class EdgeTTSService {
  private audioContext: AudioContext;

  constructor() {
    this.audioContext = new AudioContext();
  }

  /**
   * Generate speech using Microsoft Edge TTS and convert to AudioBuffer
   */
  async generateSpeech(text: string, voiceId: string): Promise<AudioBuffer> {
    try {
      // Create EdgeTTS instance with text and voice
      const tts = new EdgeTTS(text, voiceId);

      // Synthesize speech
      const result = await tts.synthesize();

      // Get audio as ArrayBuffer
      const arrayBuffer = await result.audio.arrayBuffer();

      // Decode to AudioBuffer for video compilation
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      return audioBuffer;
    } catch (error) {
      console.error('[EdgeTTS] Generation error:', error);
      throw new Error(`Failed to generate speech: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create preview audio for voice selection
   */
  async createPreviewAudio(voiceId: string): Promise<void> {
    const sampleText = "Hello, I'm a professional voice for your presentation narration.";

    try {
      const tts = new EdgeTTS(sampleText, voiceId);
      const result = await tts.synthesize();
      const arrayBuffer = await result.audio.arrayBuffer();

      // Create blob and play directly
      const audioBlob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audioElement = new Audio(audioUrl);

      await audioElement.play();

      // Cleanup URL after playing
      audioElement.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
    } catch (error) {
      console.error('[EdgeTTS] Preview error:', error);
      throw new Error(`Preview failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get available voices from Microsoft Edge TTS
   */
  static async getAvailableVoices(): Promise<EdgeTTSVoice[]> {
    // Common high-quality Microsoft Edge voices
    // Full list available at: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support
    return [
      // US English
      { id: 'en-US-AriaNeural', name: 'Aria (US Female)', locale: 'en-US', gender: 'Female' },
      { id: 'en-US-GuyNeural', name: 'Guy (US Male)', locale: 'en-US', gender: 'Male' },
      { id: 'en-US-JennyNeural', name: 'Jenny (US Female)', locale: 'en-US', gender: 'Female' },
      { id: 'en-US-DavisNeural', name: 'Davis (US Male)', locale: 'en-US', gender: 'Male' },
      { id: 'en-US-AmberNeural', name: 'Amber (US Female)', locale: 'en-US', gender: 'Female' },
      { id: 'en-US-AshleyNeural', name: 'Ashley (US Female)', locale: 'en-US', gender: 'Female' },
      { id: 'en-US-BrandonNeural', name: 'Brandon (US Male)', locale: 'en-US', gender: 'Male' },
      { id: 'en-US-ChristopherNeural', name: 'Christopher (US Male)', locale: 'en-US', gender: 'Male' },
      { id: 'en-US-CoraNeural', name: 'Cora (US Female)', locale: 'en-US', gender: 'Female' },
      { id: 'en-US-ElizabethNeural', name: 'Elizabeth (US Female)', locale: 'en-US', gender: 'Female' },
      { id: 'en-US-EricNeural', name: 'Eric (US Male)', locale: 'en-US', gender: 'Male' },
      { id: 'en-US-JacobNeural', name: 'Jacob (US Male)', locale: 'en-US', gender: 'Male' },
      { id: 'en-US-MichelleNeural', name: 'Michelle (US Female)', locale: 'en-US', gender: 'Female' },
      { id: 'en-US-MonicaNeural', name: 'Monica (US Female)', locale: 'en-US', gender: 'Female' },

      // UK English
      { id: 'en-GB-LibbyNeural', name: 'Libby (UK Female)', locale: 'en-GB', gender: 'Female' },
      { id: 'en-GB-RyanNeural', name: 'Ryan (UK Male)', locale: 'en-GB', gender: 'Male' },
      { id: 'en-GB-SoniaNeural', name: 'Sonia (UK Female)', locale: 'en-GB', gender: 'Female' },
      { id: 'en-GB-ThomasNeural', name: 'Thomas (UK Male)', locale: 'en-GB', gender: 'Male' },

      // Australian English
      { id: 'en-AU-NatashaNeural', name: 'Natasha (AU Female)', locale: 'en-AU', gender: 'Female' },
      { id: 'en-AU-WilliamNeural', name: 'William (AU Male)', locale: 'en-AU', gender: 'Male' },

      // Indian English
      { id: 'en-IN-NeerjaNeural', name: 'Neerja (IN Female)', locale: 'en-IN', gender: 'Female' },
      { id: 'en-IN-PrabhatNeural', name: 'Prabhat (IN Male)', locale: 'en-IN', gender: 'Male' },
    ];
  }

  getAudioContext(): AudioContext {
    return this.audioContext;
  }

  cleanup(): void {
    this.audioContext.close();
  }
}

export interface EdgeTTSVoice {
  id: string;
  name: string;
  locale: string;
  gender: 'Male' | 'Female';
}
