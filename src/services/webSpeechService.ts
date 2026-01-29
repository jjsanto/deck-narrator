/**
 * Web Speech API Service - Free browser-based TTS
 * No API key required, works offline
 */

export class WebSpeechService {
  private audioContext: AudioContext;

  constructor() {
    this.audioContext = new AudioContext();
  }

  /**
   * Check if Web Speech API is supported in this browser
   */
  static isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  /**
   * Get available voices from the browser
   */
  static getAvailableVoices(): SpeechSynthesisVoice[] {
    return window.speechSynthesis.getVoices();
  }

  /**
   * Generate speech using Web Speech API and convert to AudioBuffer
   */
  async generateSpeech(text: string, voiceId: string): Promise<AudioBuffer> {
    if (!WebSpeechService.isSupported()) {
      throw new Error('Web Speech API is not supported in this browser');
    }

    // Wait for voices to load
    await this.waitForVoices();

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);

      // Find and set the voice
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = voices.find(v => v.voiceURI === voiceId || v.name === voiceId);

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // Configure utterance
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Record audio using MediaRecorder
      const mediaStreamDestination = this.audioContext.createMediaStreamDestination();
      const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          const arrayBuffer = await audioBlob.arrayBuffer();
          const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
          resolve(audioBuffer);
        } catch (error) {
          reject(new Error(`Failed to decode audio: ${error}`));
        }
      };

      // Start recording
      mediaRecorder.start();

      // Speak the text
      utterance.onend = () => {
        setTimeout(() => {
          mediaRecorder.stop();
        }, 500); // Add small delay to ensure all audio is captured
      };

      utterance.onerror = (event) => {
        mediaRecorder.stop();
        reject(new Error(`Speech synthesis failed: ${event.error}`));
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Create preview audio for voice selection
   */
  async createPreviewAudio(voiceId: string): Promise<string> {
    const sampleText = "Hello, I'm a professional voice for your presentation narration.";

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(sampleText);

      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = voices.find(v => v.voiceURI === voiceId || v.name === voiceId);

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => {
        resolve('preview-complete');
      };

      utterance.onerror = (event) => {
        reject(new Error(`Preview failed: ${event.error}`));
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Wait for voices to be loaded (some browsers load them asynchronously)
   */
  private waitForVoices(): Promise<void> {
    return new Promise((resolve) => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve();
        return;
      }

      // Wait for voiceschanged event
      window.speechSynthesis.onvoiceschanged = () => {
        resolve();
      };

      // Fallback timeout
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  }

  getAudioContext(): AudioContext {
    return this.audioContext;
  }

  cleanup(): void {
    window.speechSynthesis.cancel();
    this.audioContext.close();
  }
}
