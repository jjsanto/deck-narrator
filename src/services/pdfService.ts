import { API_CONFIG } from '../config/api';
import type { Slide } from '../types';

declare global {
  interface Window {
    pdfjsLib: {
      GlobalWorkerOptions: { workerSrc: string };
      getDocument: (src: ArrayBuffer | Uint8Array | { data: ArrayBuffer }) => {
        promise: Promise<PDFDocumentProxy>;
      };
    };
  }
}

interface PDFDocumentProxy {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PDFPageProxy>;
}

interface PDFPageProxy {
  getViewport: (params: { scale: number }) => PDFViewport;
  render: (params: { canvasContext: CanvasRenderingContext2D; viewport: PDFViewport }) => {
    promise: Promise<void>;
  };
}

interface PDFViewport {
  width: number;
  height: number;
}

export class PDFService {
  private static initialized = false;

  static async initialize(): Promise<void> {
    if (this.initialized) return;

    // Load PDF.js library from CDN
    await this.loadScript(`${API_CONFIG.pdfJs.cdnUrl}/pdf.min.js`);

    // Set worker
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      `${API_CONFIG.pdfJs.cdnUrl}/pdf.worker.min.js`;

    this.initialized = true;
  }

  private static loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  static async extractSlides(file: File): Promise<Slide[]> {
    await this.initialize();

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const slides: Slide[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: API_CONFIG.pdfJs.scale });

      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error(`Failed to get canvas context for page ${pageNum}`);
      }

      // Render PDF page to canvas
      await page.render({ canvasContext: context, viewport }).promise;

      // Convert to base64 PNG
      const imageDataUrl = canvas.toDataURL('image/png');

      slides.push({
        id: `slide-${pageNum}`,
        pageNumber: pageNum,
        imageDataUrl,
        script: '',
        wordCount: 0,
        charCount: 0,
      });
    }

    return slides;
  }

  static countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  static countChars(text: string): number {
    return text.length;
  }
}
