import React, { useState, useRef, useEffect } from 'react';
import { VOICE_PROFILES, DEFAULT_VOICE, type VoiceProfile } from '../config/voices';
import { API_CONFIG } from '../config/api';
import { TTSService } from '../services/ttsService';
import { WebSpeechService } from '../services/webSpeechService';
import type { TTSProvider } from '../types';

interface UploadSetupProps {
  onComplete: (
    file: File,
    voiceId: string,
    ttsProvider: TTSProvider,
    apiKeys: { openRouter: string; lemonfox: string }
  ) => void;
}

export const UploadSetup: React.FC<UploadSetupProps> = ({ onComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedVoice, setSelectedVoice] = useState(DEFAULT_VOICE);
  const [ttsProvider, setTtsProvider] = useState<TTSProvider>('webspeech');
  const [openRouterKey, setOpenRouterKey] = useState('');
  const [lemonfoxKey, setLemonfoxKey] = useState('');
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterRegion, setFilterRegion] = useState<'ALL' | 'US' | 'UK'>('ALL');
  const [webSpeechVoices, setWebSpeechVoices] = useState<SpeechSynthesisVoice[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load Web Speech voices
  useEffect(() => {
    if (ttsProvider === 'webspeech' && WebSpeechService.isSupported()) {
      const loadVoices = () => {
        const voices = WebSpeechService.getAvailableVoices();
        setWebSpeechVoices(voices);
        if (voices.length > 0 && !selectedVoice) {
          setSelectedVoice(voices[0].voiceURI || voices[0].name);
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [ttsProvider]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (selectedFile.type !== 'application/pdf') {
      setError('Please select a valid PDF file');
      return;
    }

    // Validate file size
    const maxSizeBytes = API_CONFIG.upload.maxSizeMB * 1024 * 1024;
    if (selectedFile.size > maxSizeBytes) {
      setError(`File size must be under ${API_CONFIG.upload.maxSizeMB}MB`);
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleVoicePreview = async (voiceId: string) => {
    setIsPlayingPreview(true);
    setError(null);

    try {
      if (ttsProvider === 'webspeech') {
        const service = new WebSpeechService();
        await service.createPreviewAudio(voiceId);
        setIsPlayingPreview(false);
      } else {
        if (!lemonfoxKey) {
          setError('Please enter your Lemonfox API key first');
          setIsPlayingPreview(false);
          return;
        }

        const ttsService = new TTSService(lemonfoxKey);
        const audioUrl = await ttsService.createPreviewAudio(voiceId);

        if (audioRef.current) {
          audioRef.current.pause();
        }

        audioRef.current = new Audio(audioUrl);
        audioRef.current.onended = () => setIsPlayingPreview(false);
        await audioRef.current.play();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preview voice');
      setIsPlayingPreview(false);
    }
  };

  const handleSubmit = () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    if (!openRouterKey) {
      setError('Please enter your OpenRouter API key');
      return;
    }

    if (ttsProvider === 'lemonfox' && !lemonfoxKey) {
      setError('Please enter your Lemonfox API key or switch to Web Speech (Free)');
      return;
    }

    onComplete(file, selectedVoice, ttsProvider, {
      openRouter: openRouterKey,
      lemonfox: lemonfoxKey,
    });
  };

  const lemonfoxVoices: VoiceProfile[] = VOICE_PROFILES.filter(
    (v) => filterRegion === 'ALL' || v.region === filterRegion
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Deck Narrator
        </h1>
        <p className="text-gray-300 text-lg">
          Transform your PDF presentations into AI-narrated videos
        </p>
      </div>

      {/* TTS Provider Selection */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-white mb-4">Choose TTS Provider</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => {
              setTtsProvider('webspeech');
              setSelectedVoice('');
            }}
            className={`p-6 rounded-xl border-2 transition-all ${
              ttsProvider === 'webspeech'
                ? 'border-green-500 bg-green-500/10'
                : 'border-glass-border bg-glass-bg hover:bg-glass-hover'
            }`}
          >
            <div className="text-left space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🆓</span>
                <h3 className="text-xl font-semibold text-white">Web Speech API</h3>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                  FREE
                </span>
              </div>
              <p className="text-sm text-gray-400">
                Browser-based TTS • No API key needed • Works offline
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>✓ Completely free</li>
                <li>✓ No limits</li>
                <li>✓ Great for testing</li>
                <li>• Voice quality varies by browser/OS</li>
              </ul>
            </div>
          </button>

          <button
            onClick={() => {
              setTtsProvider('lemonfox');
              setSelectedVoice(DEFAULT_VOICE);
            }}
            className={`p-6 rounded-xl border-2 transition-all ${
              ttsProvider === 'lemonfox'
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-glass-border bg-glass-bg hover:bg-glass-hover'
            }`}
          >
            <div className="text-left space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                <h3 className="text-xl font-semibold text-white">Lemonfox TTS</h3>
                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                  PREMIUM
                </span>
              </div>
              <p className="text-sm text-gray-400">
                Professional TTS • API key required • 28 premium voices
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>✓ Studio-quality voices</li>
                <li>✓ 28 voice profiles</li>
                <li>✓ Consistent quality</li>
                <li>• Requires API key</li>
              </ul>
            </div>
          </button>
        </div>
      </div>

      {/* API Keys Section */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-white mb-4">API Configuration</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              OpenRouter API Key <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              value={openRouterKey}
              onChange={(e) => setOpenRouterKey(e.target.value)}
              placeholder="sk-or-..."
              className="glass-input"
            />
            <p className="text-xs text-gray-400 mt-1">
              Used for AI script generation • Get at openrouter.ai
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Lemonfox TTS API Key {ttsProvider === 'lemonfox' && <span className="text-red-400">*</span>}
            </label>
            <input
              type="password"
              value={lemonfoxKey}
              onChange={(e) => setLemonfoxKey(e.target.value)}
              placeholder="lf-..."
              className="glass-input"
              disabled={ttsProvider === 'webspeech'}
            />
            <p className="text-xs text-gray-400 mt-1">
              {ttsProvider === 'webspeech'
                ? 'Not needed for Web Speech API'
                : 'Used for text-to-speech • Get at lemonfox.ai'}
            </p>
          </div>
        </div>
      </div>

      {/* PDF Upload Section */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-white mb-4">Upload Presentation</h2>
        <div
          className="border-2 border-dashed border-glass-border rounded-xl p-12 text-center cursor-pointer
                     hover:border-purple-500/50 hover:bg-glass-hover transition-all duration-300"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="space-y-4">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {file ? (
              <div>
                <p className="text-green-400 font-medium">{file.name}</p>
                <p className="text-gray-400 text-sm">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-gray-300 text-lg">
                  Click to upload or drag and drop
                </p>
                <p className="text-gray-400 text-sm">
                  PDF files up to {API_CONFIG.upload.maxSizeMB}MB
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Voice Selection Section */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-white">Select Voice</h2>
          {ttsProvider === 'lemonfox' && (
            <div className="flex gap-2">
              {(['ALL', 'US', 'UK'] as const).map((region) => (
                <button
                  key={region}
                  onClick={() => setFilterRegion(region)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filterRegion === region
                      ? 'bg-purple-500/30 text-white'
                      : 'bg-glass-bg text-gray-400 hover:text-white'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-2">
          {ttsProvider === 'lemonfox' ? (
            // Lemonfox voices
            lemonfoxVoices.map((voice: VoiceProfile) => (
              <div
                key={voice.id}
                className={`glass-card-hover p-4 cursor-pointer ${
                  selectedVoice === voice.id ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => setSelectedVoice(voice.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{voice.name}</h3>
                    <p className="text-sm text-gray-400">
                      {voice.gender} • {voice.region}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">{voice.description}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVoicePreview(voice.id);
                    }}
                    disabled={isPlayingPreview}
                    className="ml-2 p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30
                             disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <svg
                      className="w-5 h-5 text-purple-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          ) : (
            // Web Speech voices
            webSpeechVoices.map((voice) => (
              <div
                key={voice.voiceURI}
                className={`glass-card-hover p-4 cursor-pointer ${
                  selectedVoice === (voice.voiceURI || voice.name) ? 'ring-2 ring-green-500' : ''
                }`}
                onClick={() => setSelectedVoice(voice.voiceURI || voice.name)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{voice.name}</h3>
                    <p className="text-sm text-gray-400">
                      {voice.lang}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {voice.localService ? 'Local' : 'Remote'}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVoicePreview(voice.voiceURI || voice.name);
                    }}
                    disabled={isPlayingPreview}
                    className="ml-2 p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30
                             disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <svg
                      className="w-5 h-5 text-green-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {ttsProvider === 'webspeech' && webSpeechVoices.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            Loading voices... If no voices appear, Web Speech API may not be supported in your browser.
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="glass-card p-4 bg-red-500/10 border-red-500/50">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!file || !openRouterKey || (ttsProvider === 'lemonfox' && !lemonfoxKey)}
          className="glass-button-primary text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Script Review →
        </button>
      </div>
    </div>
  );
};
