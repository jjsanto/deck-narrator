import React, { useState, useRef } from 'react';
import { VOICE_PROFILES, DEFAULT_VOICE } from '../config/voices';
import { API_CONFIG } from '../config/api';
import { TTSService } from '../services/ttsService';

interface UploadSetupProps {
  onComplete: (file: File, voiceId: string, apiKeys: { openRouter: string; lemonfox: string }) => void;
}

export const UploadSetup: React.FC<UploadSetupProps> = ({ onComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedVoice, setSelectedVoice] = useState(DEFAULT_VOICE);
  const [openRouterKey, setOpenRouterKey] = useState('');
  const [lemonfoxKey, setLemonfoxKey] = useState('');
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterRegion, setFilterRegion] = useState<'ALL' | 'US' | 'UK'>('ALL');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
    if (!lemonfoxKey) {
      setError('Please enter your Lemonfox API key first');
      return;
    }

    setIsPlayingPreview(true);
    setError(null);

    try {
      const ttsService = new TTSService(lemonfoxKey);
      const audioUrl = await ttsService.createPreviewAudio(voiceId);

      if (audioRef.current) {
        audioRef.current.pause();
      }

      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlayingPreview(false);
      await audioRef.current.play();
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

    if (!openRouterKey || !lemonfoxKey) {
      setError('Please enter both API keys');
      return;
    }

    onComplete(file, selectedVoice, {
      openRouter: openRouterKey,
      lemonfox: lemonfoxKey,
    });
  };

  const filteredVoices = VOICE_PROFILES.filter(
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

      {/* API Keys Section */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-white mb-4">API Configuration</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              OpenRouter API Key
            </label>
            <input
              type="password"
              value={openRouterKey}
              onChange={(e) => setOpenRouterKey(e.target.value)}
              placeholder="sk-or-..."
              className="glass-input"
            />
            <p className="text-xs text-gray-400 mt-1">
              Used for AI script generation
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Lemonfox TTS API Key
            </label>
            <input
              type="password"
              value={lemonfoxKey}
              onChange={(e) => setLemonfoxKey(e.target.value)}
              placeholder="lf-..."
              className="glass-input"
            />
            <p className="text-xs text-gray-400 mt-1">
              Used for text-to-speech synthesis
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
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-2">
          {filteredVoices.map((voice) => (
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
                  disabled={isPlayingPreview || !lemonfoxKey}
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
          ))}
        </div>
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
          disabled={!file || !openRouterKey || !lemonfoxKey}
          className="glass-button-primary text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Script Review →
        </button>
      </div>
    </div>
  );
};
