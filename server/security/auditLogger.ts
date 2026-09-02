import { IRepository } from '../database/repositoryInterface.js';

export interface AuditLogEntry {
  id?: string;
  userId: string;
  userEmail?: string;
  action: 
    | 'CREATE_QUESTION' 
    | 'UPDATE_QUESTION' 
    | 'DELETE_QUESTION' 
    | 'APPROVE_QUESTION' 
    | 'CREATE_BLUEPRINT' 
    | 'UPDATE_USER_ROLE' 
    | 'SYSTEM_CONFIG'
    | 'CREATE_POST'
    | 'UPDATE_POST'
    | 'DELETE_POST'
    | 'PUBLISH_POST'
    | 'ARCHIVE_POST'
    | 'UPLOAD_DOCUMENT'
    | 'UPDATE_DOCUMENT'
    | 'ARCHIVE_DOCUMENT'
    | 'DELETE_DOCUMENT';
  resourceType: 'question' | 'blueprint' | 'user' | 'system' | 'post' | 'document' | 'media';
  resourceId: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt?: string;
}

export class AuditLogger {
  constructor(private db: IRepository) {}

  async log(entry: AuditLogEntry): Promise<void> {
    try {
      const fullEntry = {
        ...entry,
        id: entry.id || `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: entry.createdAt || new Date().toISOString()
      };
      await this.db.recordAuditLog(fullEntry);
    } catch (err) {
      console.error('[AuditLogger] Failed to write audit log:', err);
    }
  }
}
