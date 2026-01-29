# Deck Narrator

Transform PDF presentations into AI-narrated videos with a beautiful glassmorphism UI.

## Features

- 🎬 **4-Stage Workflow**: Upload → Review → Generate → Download
- 🎙️ **28 Professional Voices**: 20 US voices + 8 UK voices
- 🖼️ **High-Quality Rendering**: 2× PDF scale with 30 FPS video output
- 🤖 **AI-Powered Scripts**: Automatic narration generation using Google Gemini
- 🎨 **Glassmorphism Dark Theme**: Beautiful modern UI with Tailwind CSS
- 🔒 **100% Client-Side**: Your PDFs never leave your device
- 📦 **No Server Required**: All processing happens in your browser

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v3 (glassmorphism theme)
- **PDF Processing**: PDF.js v3.11.174
- **AI Vision**: OpenRouter API (google/gemini-flash-1.5)
- **Text-to-Speech**: Lemonfox TTS API
- **Video Encoding**: MediaRecorder API + Web Audio API
- **Deployment**: Cloudflare Pages
- **Process Manager**: PM2

## Prerequisites

- Node.js 18+
- npm or yarn
- OpenRouter API key (for script generation)
- Lemonfox TTS API key (for voice synthesis)

## Installation

```bash
# Install dependencies
npm install

# Or with yarn
yarn install
```

## Development

### Start Development Server

```bash
# Standard mode (port 3000)
npm run dev

# With PM2 (recommended for production-like environment)
npm run pm2:start
npm run pm2:logs  # View logs
npm run pm2:stop  # Stop server
```

### Available Scripts

- `npm run dev` - Start Vite dev server on port 3000
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run pm2:start` - Start with PM2
- `npm run pm2:stop` - Stop PM2 server
- `npm run pm2:restart` - Restart PM2 server
- `npm run pm2:logs` - View PM2 logs

## Deployment to Cloudflare Pages

### Prerequisites

```bash
# Install Wrangler CLI globally
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

### Deploy

```bash
# Production deployment
npm run deploy

# Preview deployment
npm run deploy:preview
```

## How to Use

### 1. Upload & Setup

1. Enter your **OpenRouter API key** (for AI script generation)
2. Enter your **Lemonfox TTS API key** (for text-to-speech)
3. Upload a **PDF file** (max 50MB)
4. Select a **voice profile** from 28 options (preview available)
5. Click "Continue to Script Review"

### 2. Script Review & Editing

1. View AI-generated narration scripts for each slide
2. Edit scripts as needed (recommended: under 80 words)
3. Regenerate individual scripts or all empty scripts
4. See word/character counts in real-time
5. Click "Continue to Video Generation"

### 3. Video Generation

1. Watch real-time progress (0-100%)
2. TTS generation for all slides
3. Video rendering and encoding
4. Automatic transition to download page

### 4. Download

1. Preview your video in the embedded player
2. Download as MP4 (or WebM fallback)
3. Start over to create another video

## API Configuration

### OpenRouter API

- **Endpoint**: `https://openrouter.ai/api/v1/chat/completions`
- **Model**: `google/gemini-flash-1.5`
- **Purpose**: Vision AI for script generation
- **Get API Key**: [OpenRouter Dashboard](https://openrouter.ai/)

### Lemonfox TTS API

- **Endpoint**: `https://api.lemonfox.ai/v1/audio/speech`
- **Model**: `tts-1`
- **Purpose**: Text-to-speech synthesis
- **Get API Key**: [Lemonfox Dashboard](https://lemonfox.ai/)

## Voice Profiles

### US Voices (20)
rachel, domi, bella, antoni, elli, josh, arnold, adam, sam, clyde, dave, fin, grace, heidi, james, jeremy, jessie, liam, michael, arnold

### UK Voices (8)
alice, george, lily, harry, charlotte, sarah, william, thomas

## Technical Specifications

- **PDF Scale**: 2× for high-quality slide images
- **Video FPS**: 30 frames per second
- **Audio Padding**: 400ms between slides
- **Bitrate**: 5 Mbps
- **Codecs**: MP4 (avc1 + opus) or WebM (vp9 + opus)
- **Max PDF Size**: 50MB
- **Recommended Script Length**: Under 80 words per slide

## Project Structure

```
deck-narrator/
├── src/
│   ├── components/        # React components
│   │   ├── UploadSetup.tsx
│   │   ├── ScriptReview.tsx
│   │   ├── VideoGeneration.tsx
│   │   └── Download.tsx
│   ├── services/          # Core services
│   │   ├── pdfService.ts
│   │   ├── openRouterService.ts
│   │   ├── ttsService.ts
│   │   └── videoCompiler.ts
│   ├── config/            # Configuration
│   │   ├── api.ts
│   │   └── voices.ts
│   ├── types/             # TypeScript types
│   │   └── index.ts
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── ecosystem.config.js    # PM2 configuration
├── wrangler.toml          # Cloudflare Pages config
├── tailwind.config.js     # Tailwind configuration
├── vite.config.ts         # Vite configuration
└── package.json           # Dependencies
```

## Troubleshooting

### Build Errors

If you encounter esbuild compatibility issues on older macOS versions:
- The app should still work in development mode despite warnings
- Use `yarn` instead of `npm` if issues persist

### Video Generation Fails

- Ensure both API keys are valid
- Check browser console for detailed error messages
- Verify PDF is under 50MB and valid format
- Keep the browser tab active during generation

### Audio Not Playing

- Check that scripts are not empty
- Verify Lemonfox API key is correct
- Some browsers may block autoplay - click play manually

### Slow Performance

- Use smaller PDFs (fewer pages)
- Shorten scripts to reduce TTS processing time
- Close other browser tabs
- Use a modern browser (Chrome, Edge, Firefox)

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14.1+

## License

MIT

## Privacy

All processing happens in your browser. Your PDFs, scripts, and videos never leave your device. API keys are only used for AI generation and are not stored.

---

Built with ❤️ using React 19, Vite, and Tailwind CSS
