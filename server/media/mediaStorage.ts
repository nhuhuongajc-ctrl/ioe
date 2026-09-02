import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface SavedMediaResult {
  id: string;
  storedName: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  relativePath: string;
  url: string;
}

export interface IMediaStorage {
  saveFile(fileBuffer: Buffer, fileName: string, mimeType: string, category: 'images' | 'audio' | 'documents'): Promise<SavedMediaResult>;
  saveDocument(fileBuffer: Buffer, originalName: string, mimeType?: string): Promise<SavedMediaResult>;
  saveImage(fileBuffer: Buffer, originalName: string, mimeType?: string): Promise<SavedMediaResult>;
  getFilePath(category: 'images' | 'audio' | 'documents', fileName: string): string | null;
  deleteFile(category: 'images' | 'audio' | 'documents', fileName: string): Promise<boolean>;
  getStream(storagePath: string): fs.ReadStream | null;
}

// Whitelisted MIME Types & Extensions
const ALLOWED_DOC_EXTENSIONS = new Set(['.pdf', '.docx', '.xlsx', '.pptx', '.zip', '.mp3', '.png', '.jpg', '.jpeg']);
const ALLOWED_IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif']);

const MIME_MAP: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.zip': 'application/zip',
  '.mp3': 'audio/mpeg',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif'
};

export class LocalFileSystemMediaStorage implements IMediaStorage {
  private baseDir: string;
  private documentsDir: string;
  private imagesDir: string;
  private audioDir: string;

  constructor() {
    // Primary path: /home/qzmivzbj/app-data/ioe/media/
    // Fallback: ./data/media or env
    const primaryPath = '/home/qzmivzbj/app-data/ioe/media';
    const fallbackPath = process.env.MEDIA_STORAGE_PATH || path.join(process.cwd(), 'data', 'media');

    let chosenBase = fallbackPath;
    try {
      if (fs.existsSync('/home/qzmivzbj/app-data/ioe') || this.canAccessDirectory('/home/qzmivzbj')) {
        chosenBase = primaryPath;
      }
    } catch {
      chosenBase = fallbackPath;
    }

    this.baseDir = chosenBase;
    this.documentsDir = path.join(this.baseDir, 'documents');
    this.imagesDir = path.join(this.baseDir, 'images');
    this.audioDir = path.join(this.baseDir, 'audio');

    this.ensureDirectories();
  }

  private canAccessDirectory(dir: string): boolean {
    try {
      fs.accessSync(dir, fs.constants.W_OK);
      return true;
    } catch {
      return false;
    }
  }

  private ensureDirectories() {
    try {
      [this.documentsDir, this.imagesDir, this.audioDir].forEach(dir => {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      });
    } catch (err) {
      // If primary directory failed, fallback to local cwd/data/media
      const localFallback = path.join(process.cwd(), 'data', 'media');
      this.baseDir = localFallback;
      this.documentsDir = path.join(this.baseDir, 'documents');
      this.imagesDir = path.join(this.baseDir, 'images');
      this.audioDir = path.join(this.baseDir, 'audio');

      [this.documentsDir, this.imagesDir, this.audioDir].forEach(dir => {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      });
    }
  }

  /**
   * Validate and sanitize file name to prevent path traversal
   */
  private sanitizeFileName(originalName: string): string {
    const base = path.basename(originalName);
    // Remove control characters, traversal markers, null bytes
    return base.replace(/[\x00-\x1f\x7f\\/:*?"<>|]/g, '_').replace(/\.\.+/g, '.').substring(0, 150);
  }

  /**
   * Validate Magic Bytes against known file headers
   */
  private validateMagicBytes(buffer: Buffer, ext: string): boolean {
    if (!buffer || buffer.length < 4) return false;

    // PDF magic bytes: %PDF (0x25 0x50 0x44 0x46)
    if (ext === '.pdf') {
      return buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
    }
    // PNG magic bytes: 89 50 4E 47
    if (ext === '.png') {
      return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
    }
    // JPEG magic bytes: FF D8 FF
    if (ext === '.jpg' || ext === '.jpeg') {
      return buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
    }
    // ZIP & Office XML (docx, xlsx, pptx): PK.. (0x50 0x4B 0x03 0x04)
    if (ext === '.zip' || ext === '.docx' || ext === '.xlsx' || ext === '.pptx') {
      return buffer[0] === 0x50 && buffer[1] === 0x4B && (buffer[2] === 0x03 || buffer[2] === 0x05 || buffer[2] === 0x07);
    }
    // MP3: ID3 or Frame Sync (0xFF)
    if (ext === '.mp3') {
      return (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) || buffer[0] === 0xFF;
    }

    return true; // Allow if extension is whitelisted
  }

  async saveDocument(fileBuffer: Buffer, originalName: string, reportedMime?: string): Promise<SavedMediaResult> {
    const safeOriginal = this.sanitizeFileName(originalName);
    const ext = path.extname(safeOriginal).toLowerCase() || '.pdf';

    if (!ALLOWED_DOC_EXTENSIONS.has(ext)) {
      throw new Error(`Định dạng tệp ${ext} không được hỗ trợ. Chỉ cho phép: PDF, DOCX, XLSX, PPTX, ZIP, MP3, PNG, JPG`);
    }

    // Size limit: 50MB
    const MAX_DOC_SIZE = 50 * 1024 * 1024;
    if (fileBuffer.length > MAX_DOC_SIZE) {
      throw new Error('Dung lượng tệp vượt quá giới hạn cho phép (Tối đa 50MB).');
    }

    // Verify magic bytes
    if (!this.validateMagicBytes(fileBuffer, ext)) {
      throw new Error('Nội dung tệp không hợp lệ hoặc bị lỗi định dạng.');
    }

    const mimeType = MIME_MAP[ext] || reportedMime || 'application/octet-stream';
    const randomHash = crypto.randomBytes(16).toString('hex');
    const storedName = `doc_${Date.now()}_${randomHash}${ext}`;
    const storagePath = path.join(this.documentsDir, storedName);

    this.ensureDirectories();
    await fs.promises.writeFile(storagePath, fileBuffer);

    const safeId = `doc-file-${randomHash.substring(0, 10)}`;

    return {
      id: safeId,
      storedName,
      fileName: safeOriginal,
      mimeType,
      fileSize: fileBuffer.length,
      storagePath,
      relativePath: `documents/${storedName}`,
      url: `/api/content/documents/download/${storedName}`
    };
  }

  async saveImage(fileBuffer: Buffer, originalName: string, reportedMime?: string): Promise<SavedMediaResult> {
    const safeOriginal = this.sanitizeFileName(originalName);
    const ext = path.extname(safeOriginal).toLowerCase() || '.png';

    if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
      throw new Error(`Định dạng ảnh ${ext} không hợp lệ. Chỉ cho phép PNG, JPG, JPEG, WEBP, SVG`);
    }

    // Size limit: 10MB
    const MAX_IMG_SIZE = 10 * 1024 * 1024;
    if (fileBuffer.length > MAX_IMG_SIZE) {
      throw new Error('Dung lượng ảnh vượt quá giới hạn 10MB.');
    }

    if (ext !== '.svg' && !this.validateMagicBytes(fileBuffer, ext)) {
      throw new Error('Nội dung ảnh không hợp lệ.');
    }

    const mimeType = MIME_MAP[ext] || reportedMime || 'image/png';
    const randomHash = crypto.randomBytes(16).toString('hex');
    const storedName = `img_${Date.now()}_${randomHash}${ext}`;
    const storagePath = path.join(this.imagesDir, storedName);

    this.ensureDirectories();
    await fs.promises.writeFile(storagePath, fileBuffer);

    const safeId = `media-${randomHash.substring(0, 10)}`;

    return {
      id: safeId,
      storedName,
      fileName: safeOriginal,
      mimeType,
      fileSize: fileBuffer.length,
      storagePath,
      relativePath: `images/${storedName}`,
      url: `/api/media/images/${storedName}`
    };
  }

  async saveFile(fileBuffer: Buffer, fileName: string, mimeType: string, category: 'images' | 'audio' | 'documents'): Promise<SavedMediaResult> {
    if (category === 'documents') {
      return this.saveDocument(fileBuffer, fileName, mimeType);
    }
    if (category === 'images') {
      return this.saveImage(fileBuffer, fileName, mimeType);
    }

    // Audio
    const safeOriginal = this.sanitizeFileName(fileName);
    const ext = path.extname(safeOriginal).toLowerCase() || '.mp3';
    const randomHash = crypto.randomBytes(16).toString('hex');
    const storedName = `audio_${Date.now()}_${randomHash}${ext}`;
    const storagePath = path.join(this.audioDir, storedName);

    this.ensureDirectories();
    await fs.promises.writeFile(storagePath, fileBuffer);

    return {
      id: `audio-${randomHash.substring(0, 10)}`,
      storedName,
      fileName: safeOriginal,
      mimeType: mimeType || 'audio/mpeg',
      fileSize: fileBuffer.length,
      storagePath,
      relativePath: `audio/${storedName}`,
      url: `/api/media/audio/${storedName}`
    };
  }

  getFilePath(category: 'images' | 'audio' | 'documents', fileName: string): string | null {
    const safeName = path.basename(fileName);
    let targetDir = this.imagesDir;
    if (category === 'documents') targetDir = this.documentsDir;
    if (category === 'audio') targetDir = this.audioDir;

    const fullPath = path.join(targetDir, safeName);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
    return null;
  }

  getStream(storagePath: string): fs.ReadStream | null {
    if (fs.existsSync(storagePath)) {
      return fs.createReadStream(storagePath);
    }
    return null;
  }

  async deleteFile(category: 'images' | 'audio' | 'documents', fileName: string): Promise<boolean> {
    const filePath = this.getFilePath(category, fileName);
    if (filePath && fs.existsSync(filePath)) {
      try {
        await fs.promises.unlink(filePath);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}
