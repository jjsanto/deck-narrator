import { API_CONFIG } from '../config/api';
import type { Slide, VideoGenerationProgress } from '../types';

export class VideoCompiler {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private audioContext: AudioContext;
  private progressCallback: (progress: VideoGenerationProgress) => void;

  constructor(progressCallback: (progress: VideoGenerationProgress) => void) {
    this.canvas = document.createElement('canvas');
    const ctx = this.canvas.getContext('2d', {
      alpha: false,
      desynchronized: false
    });
    if (!ctx) {
      throw new Error('Failed to get canvas 2D context');
    }
    this.ctx = ctx;

    // Attach canvas to DOM (hidden) - some browsers need this for MediaRecorder
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '-9999px';
    this.canvas.style.left = '-9999px';
    document.body.appendChild(this.canvas);

    console.log('[VideoCompiler] Canvas attached to DOM');

    this.audioContext = new AudioContext();
    this.progressCallback = progressCallback;
  }

  async compile(slides: Slide[]): Promise<Blob> {
    try {
      // Set canvas dimensions from first slide
      const firstImage = await this.loadImage(slides[0].imageDataUrl);
      this.canvas.width = firstImage.width;
      this.canvas.height = firstImage.height;

      console.log(`[VideoCompiler] Canvas size: ${this.canvas.width}x${this.canvas.height}`);

      // Draw initial frame to ensure canvas has content
      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(firstImage, 0, 0, this.canvas.width, this.canvas.height);

      console.log(`[VideoCompiler] Initial frame drawn`);

      // Check codec support
      const mimeType = this.getSupportedMimeType();
      if (!mimeType) {
        throw new Error('No supported video codec found (tried MP4 and WebM)');
      }

      console.log(`[VideoCompiler] Using codec: ${mimeType}`);

      // Create combined audio
      const combinedAudio = await this.combineAudio(slides);
      console.log(`[VideoCompiler] Combined audio duration: ${combinedAudio.duration}s`);

      // Create MediaRecorder with automatic FPS capture
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

      console.log(`[VideoCompiler] Starting recording...`);
      mediaRecorder.start();

      // Small delay to ensure recording starts
      await new Promise(resolve => setTimeout(resolve, 100));

      audioSource.start(0);

      // Render slides
      await this.renderSlides(slides);

      // Stop recording
      console.log(`[VideoCompiler] Stopping recording...`);
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

    console.log(`[VideoCompiler] Starting rendering of ${slides.length} slides at ${fps} fps`);

    // Pre-load all images and calculate timings
    const slideData: { image: HTMLImageElement; frames: number }[] = [];
    for (const slide of slides) {
      const image = await this.loadImage(slide.imageDataUrl);
      const slideDuration = (slide.audioBuffer?.duration || 0) + paddingSeconds;
      const slideFrames = Math.ceil(slideDuration * fps);
      slideData.push({ image, frames: slideFrames });
      console.log(`[VideoCompiler] Slide loaded: duration=${slideDuration.toFixed(2)}s, frames=${slideFrames}`);
    }

    // Calculate total frames
    const totalFrames = slideData.reduce((sum, slide) => sum + slide.frames, 0);
    console.log(`[VideoCompiler] Total frames to render: ${totalFrames}`);

    // Render all frames
    let currentFrame = 0;
    let currentSlideIndex = 0;
    let frameInCurrentSlide = 0;

    const startTime = performance.now();

    while (currentFrame < totalFrames) {
      // Determine which slide to show
      if (frameInCurrentSlide >= slideData[currentSlideIndex].frames) {
        // Move to next slide
        currentSlideIndex++;
        frameInCurrentSlide = 0;

        if (currentSlideIndex >= slideData.length) {
          break; // All slides rendered
        }

        console.log(`[VideoCompiler] Moving to slide ${currentSlideIndex + 1}`);

        this.progressCallback({
          stage: 'rendering',
          currentSlide: currentSlideIndex + 1,
          totalSlides: slides.length,
          percentage: Math.round((currentFrame / totalFrames) * 100),
          message: `Rendering slide ${currentSlideIndex + 1} of ${slides.length}`,
        });
      }

      // Draw current slide
      const currentSlide = slideData[currentSlideIndex];
      this.ctx.drawImage(
        currentSlide.image,
        0, 0,
        this.canvas.width,
        this.canvas.height
      );

      currentFrame++;
      frameInCurrentSlide++;

      // Log progress occasionally
      if (currentFrame % 30 === 0) {
        console.log(`[VideoCompiler] Rendered frame ${currentFrame}/${totalFrames} (slide ${currentSlideIndex + 1})`);
      }

      // Calculate wait time until next frame should be drawn
      const targetTime = startTime + (currentFrame * frameDuration);
      const now = performance.now();
      const waitTime = targetTime - now;

      // Only wait if we're ahead of schedule
      if (waitTime > 0 && currentFrame < totalFrames) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    const elapsed = (performance.now() - startTime) / 1000;
    console.log(`[VideoCompiler] Rendering complete: ${totalFrames} frames in ${elapsed.toFixed(2)}s (expected: ${(totalFrames / fps).toFixed(2)}s)`);
  }

  private loadImage(dataUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataUrl;
    });
  }

  private getSupportedMimeType(): string | null {
    const types = API_CONFIG.video.codecs;

    for (const type of types) {
      console.log(`[VideoCompiler] Testing codec: ${type} - Supported: ${MediaRecorder.isTypeSupported(type)}`);
      if (MediaRecorder.isTypeSupported(type)) {
        console.log(`[VideoCompiler] Selected codec: ${type}`);
        return type;
      }
    }

    console.error('[VideoCompiler] No supported codecs found!');
    return null;
  }

  cleanup(): void {
    // Remove canvas from DOM
    if (this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
      console.log('[VideoCompiler] Canvas removed from DOM');
    }
    this.audioContext.close();
  }
}
