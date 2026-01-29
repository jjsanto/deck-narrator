import React, { useState } from 'react';
import { UploadSetup } from './components/UploadSetup';
import { ScriptReview } from './components/ScriptReview';
import { VideoGeneration } from './components/VideoGeneration';
import { Download } from './components/Download';
import { PDFService } from './services/pdfService';
import type { WorkflowStage, Slide, ProjectState } from './types';

function App() {
  const [stage, setStage] = useState<WorkflowStage>('upload');
  const [project, setProject] = useState<ProjectState>({
    pdfFile: null,
    selectedVoiceId: '',
    ttsProvider: 'webspeech',
    slides: [],
    finalVideoBlob: null,
    apiKeys: {
      openRouter: '',
      lemonfox: '',
    },
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUploadComplete = async (
    file: File,
    voiceId: string,
    ttsProvider: 'lemonfox' | 'webspeech',
    apiKeys: { openRouter: string; lemonfox: string }
  ) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Extract slides from PDF
      const slides = await PDFService.extractSlides(file);

      setProject({
        pdfFile: file,
        selectedVoiceId: voiceId,
        ttsProvider,
        slides,
        finalVideoBlob: null,
        apiKeys,
      });

      setStage('review');
    } catch (err) {
      console.error('PDF processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScriptReviewComplete = (slides: Slide[]) => {
    setProject((prev) => ({ ...prev, slides }));
    setStage('generate');
  };

  const handleVideoGenerationComplete = (videoBlob: Blob, slides: Slide[]) => {
    setProject((prev) => ({
      ...prev,
      slides,
      finalVideoBlob: videoBlob,
    }));
    setStage('download');
  };

  const handleStartOver = () => {
    setProject({
      pdfFile: null,
      selectedVoiceId: '',
      ttsProvider: 'webspeech',
      slides: [],
      finalVideoBlob: null,
      apiKeys: {
        openRouter: '',
        lemonfox: '',
      },
    });
    setStage('upload');
    setError(null);
  };

  const handleBackToUpload = () => {
    setStage('upload');
  };

  const handleBackToReview = () => {
    setStage('review');
  };

  const stages: WorkflowStage[] = ['upload', 'review', 'generate', 'download'];

  return (
    <div className="min-h-screen w-full">
      {/* Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-glass-bg backdrop-blur-glass border-b border-glass-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {stages.map((s, index) => (
                <React.Fragment key={s}>
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      stage === s
                        ? 'bg-purple-500/30 text-white scale-105'
                        : stages.indexOf(stage) > index
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-glass-bg text-gray-500'
                    }`}
                  >
                    <span className="font-medium">
                      {index + 1}. {s === 'upload' && 'Upload'}
                      {s === 'review' && 'Review'}
                      {s === 'generate' && 'Generate'}
                      {s === 'download' && 'Download'}
                    </span>
                  </div>
                  {index < 3 && (
                    <div className="w-8 h-0.5 bg-glass-border" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24 pb-12">
        {error && (
          <div className="max-w-4xl mx-auto px-6 mb-6">
            <div className="glass-card p-4 bg-red-500/10 border-red-500/50">
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="max-w-4xl mx-auto px-6 mb-6">
            <div className="glass-card p-4 bg-blue-500/10 border-blue-500/30">
              <p className="text-blue-400">Processing PDF... This may take a moment.</p>
            </div>
          </div>
        )}

        {stage === 'upload' && <UploadSetup onComplete={handleUploadComplete} />}

        {stage === 'review' && (
          <ScriptReview
            slides={project.slides}
            apiKey={project.apiKeys.openRouter}
            onComplete={handleScriptReviewComplete}
            onBack={handleBackToUpload}
          />
        )}

        {stage === 'generate' && (
          <VideoGeneration
            slides={project.slides}
            voiceId={project.selectedVoiceId}
            ttsProvider={project.ttsProvider}
            apiKey={project.apiKeys.lemonfox}
            onComplete={handleVideoGenerationComplete}
            onBack={handleBackToReview}
          />
        )}

        {stage === 'download' && project.finalVideoBlob && (
          <Download
            videoBlob={project.finalVideoBlob}
            onStartOver={handleStartOver}
          />
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-glass-bg backdrop-blur-glass border-t border-glass-border">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <p className="text-center text-sm text-gray-400">
            🔒 All processing happens in your browser - your files never leave your device
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
