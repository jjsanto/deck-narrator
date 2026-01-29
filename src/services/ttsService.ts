import { API_CONFIG } from '../config/api';
import type { APIError } from '../types';

export class TTSService {
  private apiKey: string;
  private audioContext: AudioContext;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.audioContext = new AudioContext();
  }

  async generateSpeech(text: string, voiceId: string): Promise<AudioBuffer> {
    try {
      const response = await fetch(API_CONFIG.lemonfox.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: API_CONFIG.lemonfox.model,
          input: text,
          voice: voiceId,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw this.createError(
          `Lemonfox TTS API error: ${response.status} ${response.statusText}`,
          error
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      return audioBuffer;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Lemonfox')) {
        throw error;
      }
      throw this.createError('Failed to generate speech', error);
    }
  }

  async createPreviewAudio(voiceId: string): Promise<string> {
    const sampleText = "Hello, I'm a professional voice for your presentation narration.";
    const audioBuffer = await this.generateSpeech(sampleText, voiceId);
    return this.audioBufferToDataUrl(audioBuffer);
  }

  private audioBufferToDataUrl(audioBuffer: AudioBuffer): string {
    // Convert AudioBuffer to WAV data URL for preview
    const wav = this.audioBufferToWav(audioBuffer);
    const blob = new Blob([wav], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  private audioBufferToWav(audioBuffer: AudioBuffer): ArrayBuffer {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    const data = new Float32Array(audioBuffer.length * numChannels);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      for (let i = 0; i < audioBuffer.length; i++) {
        data[i * numChannels + channel] = channelData[i];
      }
    }

    const dataLength = data.length * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);

    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    // WAV header
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);

    // Write audio data
    let offset = 44;
    for (let i = 0; i < data.length; i++) {
      const sample = Math.max(-1, Math.min(1, data[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }

    return buffer;
  }

  getAudioContext(): AudioContext {
    return this.audioContext;
  }

  private createError(message: string, details?: unknown): APIError {
    return {
      message,
      details,
    } as APIError;
  }
}
