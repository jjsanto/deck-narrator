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

      console.log('[PuterTTS] Generating speech:', { text: text.substring(0, 50), voiceId });

      // Parse voice ID (format: "engine:voice" e.g., "neural:Joanna")
      const [engine, voice] = voiceId.split(':');

      console.log('[PuterTTS] Using engine:', engine, 'voice:', voice);

      // Generate speech using Puter
      const audio = await this.puter.ai.txt2speech(text, {
        voice: voice || 'Joanna',
        engine: engine || 'neural',
        language: 'en-US'
      });

      console.log('[PuterTTS] Audio object received:', audio);

      // Try different ways to get audio data
      let audioUrl = audio.src || audio.url || audio.audioUrl;

      // If audio is an Audio element, get its src
      if (!audioUrl && audio instanceof HTMLAudioElement) {
        audioUrl = audio.src;
      }

      // If audio has a blob property
      if (!audioUrl && audio.blob) {
        audioUrl = URL.createObjectURL(audio.blob);
      }

      console.log('[PuterTTS] Audio URL:', audioUrl);

      if (!audioUrl) {
        console.error('[PuterTTS] Audio object structure:', Object.keys(audio));
        throw new Error('Failed to get audio URL from Puter - no src/url/blob found');
      }

      // Fetch the audio data
      console.log('[PuterTTS] Fetching audio from URL...');
      const response = await fetch(audioUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      console.log('[PuterTTS] Audio fetched, size:', arrayBuffer.byteLength);

      // Decode to AudioBuffer
      console.log('[PuterTTS] Decoding audio...');
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      console.log('[PuterTTS] Audio decoded successfully, duration:', audioBuffer.duration);

      return audioBuffer;
    } catch (error) {
      console.error('[PuterTTS] Direct URL method failed, trying alternative approach...');

      // Try alternative approach: play and capture audio
      try {
        return await this.generateSpeechViaCapture(text, voiceId);
      } catch (captureError) {
        console.error('[PuterTTS] Both methods failed');
        console.error('[PuterTTS] Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          voiceId,
          textLength: text.length
        });
        throw new Error(`Failed to generate speech: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Alternative method: Generate speech by capturing playback
   */
  private async generateSpeechViaCapture(text: string, voiceId: string): Promise<AudioBuffer> {
    console.log('[PuterTTS] Using capture method...');

    const [engine, voice] = voiceId.split(':');

    const audio = await this.puter.ai.txt2speech(text, {
      voice: voice || 'Joanna',
      engine: engine || 'neural',
      language: 'en-US'
    });

    return new Promise((resolve, reject) => {
      // Create media element source
      const audioElement = audio instanceof HTMLAudioElement ? audio : new Audio(audio.src || audio);

      // Create audio context nodes
      const source = this.audioContext.createMediaElementSource(audioElement);
      const destination = this.audioContext.createMediaStreamDestination();

      // Connect nodes
      source.connect(destination);
      source.connect(this.audioContext.destination); // Also play it

      // Record the stream
      const mediaRecorder = new MediaRecorder(destination.stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const arrayBuffer = await blob.arrayBuffer();
          const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
          resolve(audioBuffer);
        } catch (err) {
          reject(err);
        }
      };

      // Start recording and playing
      mediaRecorder.start();
      audioElement.play().catch(reject);

      // Stop recording when audio ends
      audioElement.onended = () => {
        setTimeout(() => {
          mediaRecorder.stop();
        }, 500);
      };

      audioElement.onerror = () => {
        mediaRecorder.stop();
        reject(new Error('Audio playback failed'));
      };

      // Timeout after 60 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          reject(new Error('Recording timeout'));
        }
      }, 60000);
    });
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
