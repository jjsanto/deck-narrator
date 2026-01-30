export const API_CONFIG = {
  openRouter: {
    baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'google/gemma-3-12b-it',
    maxTokens: 150,
  },
  lemonfox: {
    baseUrl: 'https://api.lemonfox.ai/v1/audio/speech',
    model: 'tts-1',
  },
  pdfJs: {
    cdnUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174',
    scale: 2,
  },
  video: {
    fps: 30,
    audioPadding: 400, // ms
    bitrate: 5000000, // 5 Mbps
    codecs: [
      // Try AAC audio for MP4 (QuickTime compatible)
      'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',
      // Fallback to Opus for MP4
      'video/mp4; codecs=avc1,opus',
      // WebM with Opus (not QuickTime compatible but widely supported)
      'video/webm; codecs=vp9,opus',
    ],
  },
  upload: {
    maxSizeMB: 50,
  },
};

export const VISION_PROMPT = `Analyze this presentation slide and generate a concise narration script (under 80 words) that:
1. Explains the main message or key point of the slide
2. Highlights important data, statistics, or visuals if present
3. Uses clear, professional language suitable for voice narration
4. Flows naturally when spoken aloud
5. Avoids reading bullet points verbatim - instead synthesize the information

Provide ONLY the narration script, no additional commentary or formatting.`;
