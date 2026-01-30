import { API_CONFIG } from '../config/api';
import type { Slide, VideoGenerationProgress } from '../types';

export class VideoCompiler {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private audioContext: AudioContext;
  private progressCallback: (progress: VideoGenerationProgress) => void;

  constructor(progressCallback: (progress: VideoGenerationProgress) => void) {
    this.canvas = document.createElement('canvas');
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas 2D context');
    }
    this.ctx = ctx;
    this.audioContext = new AudioContext();
    this.progressCallback = progressCallback;
  }

  async compile(slides: Slide[]): Promise<Blob> {
    try {
      // Set canvas dimensions from first slide
      const firstImage = await this.loadImage(slides[0].imageDataUrl);
      this.canvas.width = firstImage.width;
      this.canvas.height = firstImage.height;

      // Check codec support
      const mimeType = this.getSupportedMimeType();
      if (!mimeType) {
        throw new Error('No supported video codec found (tried MP4 and WebM)');
      }

      // Create combined audio
      const combinedAudio = await this.combineAudio(slides);

      // Create MediaRecorder
      const canvasStream = this.canvas.captureStream(API_CONFIG.video.fps);

      // Add audio track to canvas stream
      const audioDestination = this.audioContext.createMediaStreamDestination();
      const audioSource = this.audioContext.createBufferSource();
      audioSource.buffer = combinedAudio;
      audioSource.connect(audioDestination);

      const audioTrack = audioDestination.stream.getAudioTracks()[0];
      if (audioTrack) {
        canvasStream.addTrack(audioTrack);
      }

      const mediaRecorder = new MediaRecorder(canvasStream, {
        mimeType,
        videoBitsPerSecond: API_CONFIG.video.bitrate,
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      // Start recording
      const recordingPromise = new Promise<Blob>((resolve, reject) => {
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType });
          resolve(blob);
        };
        mediaRecorder.onerror = (error) => {
          reject(new Error(`MediaRecorder error: ${error}`));
        };
      });

      mediaRecorder.start();
      audioSource.start(0);

      // Render slides
      await this.renderSlides(slides);

      // Stop recording
      mediaRecorder.stop();
      audioSource.stop();

      this.progressCallback({
        stage: 'complete',
        currentSlide: slides.length,
        totalSlides: slides.length,
        percentage: 100,
        message: 'Video compilation complete',
      });

      return await recordingPromise;
    } catch (error) {
      console.error('Video compilation error:', error);
      throw error;
    }
  }

  private async combineAudio(slides: Slide[]): Promise<AudioBuffer> {
    const paddingSeconds = API_CONFIG.video.audioPadding / 1000;

    // Calculate total duration
    let totalDuration = 0;
    for (const slide of slides) {
      if (slide.audioBuffer) {
        totalDuration += slide.audioBuffer.duration + paddingSeconds;
      }
    }

    // Create combined buffer
    const sampleRate = this.audioContext.sampleRate;
    const totalSamples = Math.ceil(totalDuration * sampleRate);
    const numberOfChannels = slides[0]?.audioBuffer?.numberOfChannels || 2;

    const combinedBuffer = this.audioContext.createBuffer(
      numberOfChannels,
      totalSamples,
      sampleRate
    );

    // Copy audio data
    let offset = 0;
    for (const slide of slides) {
      if (slide.audioBuffer) {
        for (let channel = 0; channel < numberOfChannels; channel++) {
          const sourceData = slide.audioBuffer.getChannelData(channel);
          const targetData = combinedBuffer.getChannelData(channel);
          targetData.set(sourceData, offset);
        }
        offset += slide.audioBuffer.length + Math.ceil(paddingSeconds * sampleRate);
      }
    }

    return combinedBuffer;
  }

  private async renderSlides(slides: Slide[]): Promise<void> {
    const fps = API_CONFIG.video.fps;
    const frameDuration = 1000 / fps; // ms per frame
    const paddingSeconds = API_CONFIG.video.audioPadding / 1000;

    // Calculate slide timings
    const slideTimings: { startTime: number; endTime: number; image: HTMLImageElement }[] = [];
    let currentTime = 0;

    // Pre-load all images and calculate timings
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const slideDuration = (slide.audioBuffer?.duration || 0) + paddingSeconds;
      const image = await this.loadImage(slide.imageDataUrl);

      slideTimings.push({
        startTime: currentTime,
        endTime: currentTime + slideDuration,
        image: image
      });

      currentTime += slideDuration;
    }

    const totalDuration = currentTime;
    const startTime = performance.now();
    let frameCount = 0;
    const totalFrames = Math.ceil(totalDuration * fps);

    console.log(`[VideoCompiler] Rendering ${totalFrames} frames for ${slides.length} slides, total duration: ${totalDuration}s`);

    // Render frames synchronized to real time
    while (frameCount < totalFrames) {
      const elapsedMs = performance.now() - startTime;
      const elapsedSeconds = elapsedMs / 1000;

      // Find which slide should be showing at this time
      const currentSlideIndex = slideTimings.findIndex(
        timing => elapsedSeconds >= timing.startTime && elapsedSeconds < timing.endTime
      );

      if (currentSlideIndex !== -1) {
        const currentSlide = slideTimings[currentSlideIndex];

        // Draw the current slide
        this.ctx.drawImage(currentSlide.image, 0, 0, this.canvas.width, this.canvas.height);

        // Update progress
        this.progressCallback({
          stage: 'rendering',
          currentSlide: currentSlideIndex + 1,
          totalSlides: slides.length,
          percentage: Math.round((frameCount / totalFrames) * 100),
          message: `Rendering slide ${currentSlideIndex + 1} of ${slides.length}`,
        });
      }

      frameCount++;

      // Wait for next frame (synchronized to real time, not accumulated delays)
      const targetTime = startTime + (frameCount * frameDuration);
      const now = performance.now();
      const waitTime = Math.max(0, targetTime - now);

      if (waitTime > 0) {
        await this.waitForFrame(waitTime);
      }
    }

    console.log(`[VideoCompiler] Rendering complete. Rendered ${frameCount} frames in ${(performance.now() - startTime) / 1000}s`);
  }

  private loadImage(dataUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataUrl;
    });
  }

  private waitForFrame(duration: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, duration));
  }

  private getSupportedMimeType(): string | null {
    const types = [
      API_CONFIG.video.codecs.mp4,
      API_CONFIG.video.codecs.webm,
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return null;
  }

  cleanup(): void {
    this.audioContext.close();
  }
}
