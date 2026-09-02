import crypto from 'crypto';

export interface TtsRequest {
  text: string;
  voice?: string;
  speed?: number;
  language?: string;
  providerVersion?: string;
}

export interface TtsResult {
  audioUrl: string;
  audioHash: string;
  cached: boolean;
  durationMs?: number;
}

export interface ITtsProvider {
  generateAudio(req: TtsRequest): Promise<TtsResult>;
  getAudioByHash(hash: string): Promise<string | null>;
}

export class DefaultTtsProvider implements ITtsProvider {
  private cache: Map<string, string> = new Map();

  /**
   * Deterministic hash from text + voice + speed + language + providerVersion
   */
  computeHash(req: TtsRequest): string {
    const voice = req.voice || 'en-US-Standard';
    const speed = req.speed || 1.0;
    const lang = req.language || 'en-US';
    const version = req.providerVersion || 'v1';
    const normalizedText = req.text.trim().toLowerCase();

    const rawKey = `${normalizedText}#${voice}#${speed}#${lang}#${version}`;
    return crypto.createHash('sha256').update(rawKey).digest('hex').substring(0, 16);
  }

  async generateAudio(req: TtsRequest): Promise<TtsResult> {
    const hash = this.computeHash(req);
    
    if (this.cache.has(hash)) {
      return {
        audioUrl: this.cache.get(hash)!,
        audioHash: hash,
        cached: true
      };
    }

    // In a production setup, this saves audio file to Cloudflare R2 / S3 / Local audio dir
    // For now we map to standard pre-generated speech URLs or WebSpeech endpoints
    const simulatedAudioUrl = `https://actions.google.com/sounds/v1/speech/en_${hash.slice(0, 4)}.mp3`;
    this.cache.set(hash, simulatedAudioUrl);

    return {
      audioUrl: simulatedAudioUrl,
      audioHash: hash,
      cached: false
    };
  }

  async getAudioByHash(hash: string): Promise<string | null> {
    return this.cache.get(hash) || null;
  }
}

export const ttsProvider = new DefaultTtsProvider();
