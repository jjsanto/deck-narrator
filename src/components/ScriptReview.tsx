import React, { useState, useEffect } from 'react';
import type { Slide } from '../types';
import { OpenRouterService } from '../services/openRouterService';
import { PDFService } from '../services/pdfService';

interface ScriptReviewProps {
  slides: Slide[];
  apiKey: string;
  onComplete: (slides: Slide[]) => void;
  onBack: () => void;
}

export const ScriptReview: React.FC<ScriptReviewProps> = ({
  slides: initialSlides,
  apiKey,
  onComplete,
  onBack,
}) => {
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generatingAll, setGeneratingAll] = useState(false);

  useEffect(() => {
    // Auto-generate scripts if they're empty
    const hasEmptyScripts = slides.some((s) => !s.script);
    if (hasEmptyScripts && !generatingAll) {
      generateAllScripts();
    }
  }, []);

  const generateScript = async (slideId: string, imageDataUrl: string) => {
    setLoading((prev) => ({ ...prev, [slideId]: true }));
    setErrors((prev) => ({ ...prev, [slideId]: '' }));

    try {
      const service = new OpenRouterService(apiKey);
      const script = await service.generateScript(imageDataUrl);

      if (!script || script.trim().length === 0) {
        throw new Error('Generated script is empty');
      }

      updateSlideScript(slideId, script);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to generate script';
      setErrors((prev) => ({ ...prev, [slideId]: errorMsg }));
      console.error(`Error generating script for ${slideId}:`, error);
    } finally {
      setLoading((prev) => ({ ...prev, [slideId]: false }));
    }
  };

  const generateAllScripts = async () => {
    setGeneratingAll(true);

    for (const slide of slides) {
      if (!slide.script) {
        await generateScript(slide.id, slide.imageDataUrl);
      }
    }

    setGeneratingAll(false);
  };

  const updateSlideScript = (slideId: string, script: string) => {
    setSlides((prev) =>
      prev.map((slide) =>
        slide.id === slideId
          ? {
              ...slide,
              script,
              wordCount: PDFService.countWords(script),
              charCount: PDFService.countChars(script),
            }
          : slide
      )
    );
  };

  const handleScriptChange = (slideId: string, newScript: string) => {
    updateSlideScript(slideId, newScript);
  };

  const handleRegenerate = (slideId: string, imageDataUrl: string) => {
    generateScript(slideId, imageDataUrl);
  };

  const canProceed = slides.every((s) => s.script && s.script.trim().length > 0);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Review & Edit Scripts</h1>
          <p className="text-gray-400 mt-2">
            Edit the AI-generated narration for each slide
          </p>
        </div>
        <button onClick={onBack} className="glass-button">
          ← Back
        </button>
      </div>

      {/* Global Actions */}
      <div className="glass-card p-4 flex items-center justify-between">
        <div className="text-sm text-gray-300">
          <span className="font-medium">{slides.length}</span> slides •{' '}
          <span className="font-medium">
            {slides.filter((s) => s.script).length}
          </span>{' '}
          with scripts
        </div>
        <button
          onClick={generateAllScripts}
          disabled={generatingAll}
          className="glass-button disabled:opacity-50"
        >
          {generatingAll ? 'Generating...' : 'Regenerate All Empty Scripts'}
        </button>
      </div>

      {/* Slides Grid */}
      <div className="space-y-6">
        {slides.map((slide) => (
          <div key={slide.id} className="glass-card p-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Slide Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    Slide {slide.pageNumber}
                  </h3>
                  <button
                    onClick={() => handleRegenerate(slide.id, slide.imageDataUrl)}
                    disabled={loading[slide.id]}
                    className="glass-button text-sm disabled:opacity-50"
                  >
                    {loading[slide.id] ? 'Generating...' : '🔄 Regenerate'}
                  </button>
                </div>
                <div className="rounded-lg overflow-hidden border border-glass-border">
                  <img
                    src={slide.imageDataUrl}
                    alt={`Slide ${slide.pageNumber}`}
                    className="w-full h-auto"
                  />
                </div>
              </div>

              {/* Script Editor */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-medium text-gray-300">Narration Script</h4>
                  <div className="flex gap-4 text-sm text-gray-400">
                    <span>{slide.wordCount} words</span>
                    <span>{slide.charCount} chars</span>
                  </div>
                </div>

                <textarea
                  value={slide.script}
                  onChange={(e) => handleScriptChange(slide.id, e.target.value)}
                  placeholder={
                    loading[slide.id]
                      ? 'Generating script...'
                      : 'Enter narration script for this slide...'
                  }
                  disabled={loading[slide.id]}
                  className="glass-textarea h-64 disabled:opacity-50"
                />

                {errors[slide.id] && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50">
                    <p className="text-red-400 text-sm">{errors[slide.id]}</p>
                  </div>
                )}

                {slide.wordCount > 80 && (
                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/50">
                    <p className="text-yellow-400 text-sm">
                      ⚠️ Script is longer than recommended (80 words). Consider
                      shortening for better pacing.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Bar */}
      <div className="glass-card p-6 flex items-center justify-between sticky bottom-6">
        <div className="text-gray-300">
          {canProceed ? (
            <span className="text-green-400">✓ All scripts ready</span>
          ) : (
            <span className="text-yellow-400">
              ⚠️ Some slides are missing scripts
            </span>
          )}
        </div>
        <button
          onClick={() => onComplete(slides)}
          disabled={!canProceed}
          className="glass-button-primary text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Video Generation →
        </button>
      </div>
    </div>
  );
};
