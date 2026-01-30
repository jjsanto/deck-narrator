/**
 * Puter TTS Service - Free unlimited TTS using Puter.js
 * No API key required, completely free
 */

// Load Puter.js dynamically
const loadPuterJS = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).puter) {
      resolve((window as any).puter);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/';
    script.onload = () => {
      if ((window as any).puter) {
        resolve((window as any).puter);
      } else {
        reject(new Error('Puter.js failed to load'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load Puter.js'));
    document.head.appendChild(script);
  });
};

export class PuterTTSService {
  private audioContext: AudioContext;
  private puter: any = null;

  constructor() {
    this.audioContext = new AudioContext();
  }

  private async ensurePuterLoaded() {
    if (!this.puter) {
      this.puter = await loadPuterJS();
    }
  }

  /**
   * Generate speech using Puter TTS and convert to AudioBuffer
   */
  async generateSpeech(text: string, voiceId: string): Promise<AudioBuffer> {
    try {
      await this.ensurePuterLoaded();

      // Parse voice ID (format: "engine:voice" e.g., "neural:Joanna")
      const [engine, voice] = voiceId.split(':');

      // Generate speech using Puter
      const audio = await this.puter.ai.txt2speech(text, {
        voice: voice || 'Joanna',
        engine: engine || 'neural',
        language: 'en-US'
      });

      // The audio object from Puter has a src property
      const audioUrl = audio.src;

      if (!audioUrl) {
        throw new Error('Failed to get audio URL from Puter');
      }

      // Fetch the audio data
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();

      // Decode to AudioBuffer
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      return audioBuffer;
    } catch (error) {
      console.error('[PuterTTS] Generation error:', error);
      throw new Error(`Failed to generate speech: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create preview audio for voice selection
   */
  async createPreviewAudio(voiceId: string): Promise<void> {
    const sampleText = "Hello, I'm a professional voice for your presentation narration.";

    try {
      await this.ensurePuterLoaded();

      const [engine, voice] = voiceId.split(':');

      const audio = await this.puter.ai.txt2speech(sampleText, {
        voice: voice || 'Joanna',
        engine: engine || 'neural',
        language: 'en-US'
      });

      // Play the audio directly
      await audio.play();
    } catch (error) {
      console.error('[PuterTTS] Preview error:', error);
      throw new Error(`Preview failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get available voices from Puter TTS
   */
  static async getAvailableVoices(): Promise<PuterTTSVoice[]> {
    // Puter supports Amazon Polly voices
    // https://docs.aws.amazon.com/polly/latest/dg/voicelist.html
    return [
      // Neural US English voices (best quality)
      { id: 'neural:Joanna', name: 'Joanna (Neural)', locale: 'en-US', gender: 'Female', engine: 'neural' },
      { id: 'neural:Matthew', name: 'Matthew (Neural)', locale: 'en-US', gender: 'Male', engine: 'neural' },
      { id: 'neural:Ivy', name: 'Ivy (Neural)', locale: 'en-US', gender: 'Female', engine: 'neural' },
      { id: 'neural:Kendra', name: 'Kendra (Neural)', locale: 'en-US', gender: 'Female', engine: 'neural' },
      { id: 'neural:Kimberly', name: 'Kimberly (Neural)', locale: 'en-US', gender: 'Female', engine: 'neural' },
      { id: 'neural:Salli', name: 'Salli (Neural)', locale: 'en-US', gender: 'Female', engine: 'neural' },
      { id: 'neural:Joey', name: 'Joey (Neural)', locale: 'en-US', gender: 'Male', engine: 'neural' },
      { id: 'neural:Justin', name: 'Justin (Neural)', locale: 'en-US', gender: 'Male', engine: 'neural' },
      { id: 'neural:Kevin', name: 'Kevin (Neural)', locale: 'en-US', gender: 'Male', engine: 'neural' },

      // Neural UK English voices
      { id: 'neural:Amy', name: 'Amy (Neural)', locale: 'en-GB', gender: 'Female', engine: 'neural' },
      { id: 'neural:Emma', name: 'Emma (Neural)', locale: 'en-GB', gender: 'Female', engine: 'neural' },
      { id: 'neural:Brian', name: 'Brian (Neural)', locale: 'en-GB', gender: 'Male', engine: 'neural' },
      { id: 'neural:Arthur', name: 'Arthur (Neural)', locale: 'en-GB', gender: 'Male', engine: 'neural' },

      // Neural Australian English
      { id: 'neural:Olivia', name: 'Olivia (Neural)', locale: 'en-AU', gender: 'Female', engine: 'neural' },

      // Neural Indian English
      { id: 'neural:Kajal', name: 'Kajal (Neural)', locale: 'en-IN', gender: 'Female', engine: 'neural' },

      // Generative voices (most advanced, if available)
      { id: 'generative:Ruth', name: 'Ruth (Generative)', locale: 'en-US', gender: 'Female', engine: 'generative' },
      { id: 'generative:Stephen', name: 'Stephen (Generative)', locale: 'en-US', gender: 'Male', engine: 'generative' },
    ];
  }

  getAudioContext(): AudioContext {
    return this.audioContext;
  }

  cleanup(): void {
    this.audioContext.close();
  }
}

export interface PuterTTSVoice {
  id: string;
  name: string;
  locale: string;
  gender: 'Male' | 'Female';
  engine: 'neural' | 'generative';
}
