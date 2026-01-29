import React, { useState, useEffect, useRef } from 'react';

interface DownloadProps {
  videoBlob: Blob;
  onStartOver: () => void;
}

export const Download: React.FC<DownloadProps> = ({ videoBlob, onStartOver }) => {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [downloading, setDownloading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Create object URL for video preview
    const url = URL.createObjectURL(videoBlob);
    setVideoUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [videoBlob]);

  const handleDownload = () => {
    setDownloading(true);

    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `deck-narration-${Date.now()}.${getFileExtension()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setDownloading(false), 1000);
  };

  const getFileExtension = (): string => {
    return videoBlob.type.includes('mp4') ? 'mp4' : 'webm';
  };

  const getFileSizeMB = (): string => {
    return (videoBlob.size / 1024 / 1024).toFixed(2);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
          Video Ready!
        </h1>
        <p className="text-gray-300 text-lg">
          Your AI-narrated presentation video has been created successfully
        </p>
      </div>

      {/* Video Preview */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-white mb-4">Preview</h2>
        <div className="rounded-xl overflow-hidden border border-glass-border bg-black">
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            className="w-full h-auto"
            style={{ maxHeight: '70vh' }}
          >
            Your browser does not support video playback.
          </video>
        </div>

        {/* Video Info */}
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex gap-4">
            <span>Format: {getFileExtension().toUpperCase()}</span>
            <span>Size: {getFileSizeMB()} MB</span>
          </div>
          {videoRef.current && (
            <span>
              Duration:{' '}
              {videoRef.current.duration
                ? `${Math.floor(videoRef.current.duration / 60)}:${String(
                    Math.floor(videoRef.current.duration % 60)
                  ).padStart(2, '0')}`
                : 'Loading...'}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="glass-button-primary text-lg py-4 disabled:opacity-50"
        >
          {downloading ? (
            <>
              <span className="animate-pulse">⬇️ Downloading...</span>
            </>
          ) : (
            <>⬇️ Download Video</>
          )}
        </button>

        <button onClick={onStartOver} className="glass-button text-lg py-4">
          🔄 Create Another Video
        </button>
      </div>

      {/* Success Tips */}
      <div className="glass-card p-6 bg-green-500/10 border-green-500/30">
        <h3 className="text-lg font-semibold text-green-400 mb-3">
          🎓 What's Next?
        </h3>
        <ul className="space-y-2 text-sm text-green-300">
          <li>
            • Share your video on social media, YouTube, or your website
          </li>
          <li>
            • Use it in webinars, training sessions, or online courses
          </li>
          <li>
            • Embed it in your blog posts or marketing materials
          </li>
          <li>
            • All processing was done locally - your content is 100% private
          </li>
        </ul>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass-card p-6 text-center">
          <div className="text-3xl mb-2">🎬</div>
          <div className="text-2xl font-bold text-white">
            {getFileExtension().toUpperCase()}
          </div>
          <div className="text-sm text-gray-400">Video Format</div>
        </div>

        <div className="glass-card p-6 text-center">
          <div className="text-3xl mb-2">💾</div>
          <div className="text-2xl font-bold text-white">{getFileSizeMB()} MB</div>
          <div className="text-sm text-gray-400">File Size</div>
        </div>

        <div className="glass-card p-6 text-center">
          <div className="text-3xl mb-2">🔒</div>
          <div className="text-2xl font-bold text-white">100%</div>
          <div className="text-sm text-gray-400">Privacy Protected</div>
        </div>
      </div>
    </div>
  );
};
