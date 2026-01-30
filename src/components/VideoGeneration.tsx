import React, { useState, useEffect } from 'react';
import type { Slide, VideoGenerationProgress, TTSProvider } from '../types';
import { TTSService } from '../services/ttsService';
import { WebSpeechService } from '../services/webSpeechService';
import { PuterTTSService } from '../services/puterTTSService';
import { VideoCompiler } from '../services/videoCompiler';

interface VideoGenerationProps {
  slides: Slide[];
  voiceId: string;
  ttsProvider: TTSProvider;
  apiKey: string;
  onComplete: (videoBlob: Blob, slides: Slide[]) => void;
  onBack: () => void;
}

export const VideoGeneration: React.FC<VideoGenerationProps> = ({
  slides: initialSlides,
  voiceId,
  ttsProvider,
  apiKey,
  onComplete,
  onBack,
}) => {
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [progress, setProgress] = useState<VideoGenerationProgress>({
    stage: 'tts',
    currentSlide: 0,
    totalSlides: initialSlides.length,
    percentage: 0,
    message: 'Preparing...',
  });
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Auto-start generation
    startGeneration();
  }, []);

  const startGeneration = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Check if using Web Speech API - it cannot be used for video generation
      if (ttsProvider === 'webspeech') {
        throw new Error(
          'Web Speech API cannot be used for video generation. ' +
          'Please go back and select Lemonfox TTS to generate videos. ' +
          'Web Speech is only for testing scripts and voice previews.'
        );
      }

      // Step 1: Generate TTS for all slides
      setProgress({
        stage: 'tts',
        currentSlide: 0,
        totalSlides: slides.length,
        percentage: 0,
        message: 'Generating speech audio...',
      });

      // Create TTS service based on provider
      const ttsService =
        ttsProvider === 'lemonfox' ? new TTSService(apiKey) :
        ttsProvider === 'putertts' ? new PuterTTSService() :
        new WebSpeechService();

      const updatedSlides = [...slides];

      for (let i = 0; i < updatedSlides.length; i++) {
        const slide = updatedSlides[i];

        setProgress({
          stage: 'tts',
          currentSlide: i + 1,
          totalSlides: slides.length,
          percentage: Math.round(((i + 1) / slides.length) * 30),
          message: `Generating speech for slide ${i + 1} of ${slides.length}...`,
        });

        try {
          const audioBuffer = await ttsService.generateSpeech(slide.script, voiceId);
          updatedSlides[i] = {
            ...slide,
            audioBuffer,
            audioDuration: audioBuffer.duration,
          };

          // Add delay between slides to avoid rate limiting (except for last slide)
          if (ttsProvider === 'putertts' && i < updatedSlides.length - 1) {
            console.log(`[VideoGeneration] Waiting 1.5s before next slide to avoid rate limiting...`);
            await new Promise(resolve => setTimeout(resolve, 1500));
          }
        } catch (err) {
          console.error(`Failed to generate TTS for slide ${i + 1}:`, err);
          throw new Error(`Failed to generate speech for slide ${i + 1}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      setSlides(updatedSlides);

      // Step 2: Compile video
      setProgress({
        stage: 'rendering',
        currentSlide: 0,
        totalSlides: slides.length,
        percentage: 30,
        message: 'Compiling video...',
      });

      const compiler = new VideoCompiler((compileProgress) => {
        setProgress({
          ...compileProgress,
          percentage: 30 + Math.round((compileProgress.percentage / 100) * 70),
        });
      });

      const videoBlob = await compiler.compile(updatedSlides);

      compiler.cleanup();

      setProgress({
        stage: 'complete',
        currentSlide: slides.length,
        totalSlides: slides.length,
        percentage: 100,
        message: 'Video generation complete!',
      });

      // Wait a moment before transitioning
      setTimeout(() => {
        onComplete(videoBlob, updatedSlides);
      }, 1000);
    } catch (err) {
      console.error('Video generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate video');
      setIsGenerating(false);
    }
  };

  const getStageIcon = () => {
    switch (progress.stage) {
      case 'tts':
        return '🎙️';
      case 'rendering':
        return '🎬';
      case 'encoding':
        return '📹';
      case 'complete':
        return '✅';
      default:
        return '⏳';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">Generating Video</h1>
        <p className="text-gray-400">
          This may take a few minutes depending on your presentation length
        </p>
      </div>

      {/* Progress Card */}
      <div className="glass-card p-8 space-y-6">
        {/* Stage Indicator */}
        <div className="text-center">
          <div className="text-6xl mb-4">{getStageIcon()}</div>
          <h2 className="text-2xl font-semibold text-white mb-2">
            {progress.message}
          </h2>
          <p className="text-gray-400">
            {progress.stage === 'tts' && 'Converting scripts to speech...'}
            {progress.stage === 'rendering' && 'Rendering video frames...'}
            {progress.stage === 'encoding' && 'Encoding final video...'}
            {progress.stage === 'complete' && 'All done!'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Progress</span>
            <span>{progress.percentage}%</span>
          </div>
          <div className="w-full h-4 bg-glass-bg rounded-full overflow-hidden border border-glass-border">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out
                         rounded-full relative overflow-hidden"
              style={{ width: `${progress.percentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Slide Progress */}
        {progress.currentSlide > 0 && (
          <div className="text-center text-sm text-gray-400">
            Processing slide {progress.currentSlide} of {progress.totalSlides}
          </div>
        )}

        {/* Stage Pills */}
        <div className="flex items-center justify-center gap-4 pt-4">
          {['tts', 'rendering', 'encoding', 'complete'].map((stage) => (
            <div
              key={stage}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                progress.stage === stage
                  ? 'bg-purple-500/30 text-white scale-110'
                  : progress.percentage >= getStagePercentage(stage)
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-glass-bg text-gray-500'
              }`}
            >
              {stage === 'tts' && 'Speech'}
              {stage === 'rendering' && 'Rendering'}
              {stage === 'encoding' && 'Encoding'}
              {stage === 'complete' && 'Complete'}
            </div>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="glass-card p-6 bg-red-500/10 border-red-500/50 space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">❌</span>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-400 mb-2">
                Generation Failed
              </h3>
              <p className="text-red-300">{error}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={onBack} className="glass-button">
              ← Back to Scripts
            </button>
            <button
              onClick={startGeneration}
              className="glass-button-primary"
            >
              🔄 Retry
            </button>
          </div>
        </div>
      )}

      {/* Tips */}
      {!error && isGenerating && (
        <div className="glass-card p-6 bg-blue-500/10 border-blue-500/30">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">💡 Tips</h3>
          <ul className="space-y-2 text-sm text-blue-300">
            <li>• Keep this tab active for best performance</li>
            <li>• The video is being processed entirely in your browser</li>
            <li>• Your PDF and scripts never leave your device</li>
          </ul>
        </div>
      )}
    </div>
  );
};

function getStagePercentage(stage: string): number {
  switch (stage) {
    case 'tts':
      return 0;
    case 'rendering':
      return 30;
    case 'encoding':
      return 70;
    case 'complete':
      return 100;
    default:
      return 0;
  }
}
