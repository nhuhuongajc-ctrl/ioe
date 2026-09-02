import crypto from 'crypto';

const SIGNING_SECRET = process.env.ATTEMPT_SIGNING_SECRET || 'ioe_master_default_exam_signing_key_2026';

export interface ExamTicketPayload {
  attemptId: string;
  userId: string;
  grade: number;
  mode: string;
  blueprintId?: string;
  issuedAt: number;
  expiresAt: number;
}

/**
 * Creates an anti-tamper cryptographically signed token for an exam session
 */
export function generateExamTicket(payload: Omit<ExamTicketPayload, 'issuedAt' | 'expiresAt'>, durationMinutes = 35): string {
  const issuedAt = Date.now();
  const expiresAt = issuedAt + (durationMinutes + 5) * 60 * 1000; // grace period of 5 mins

  const data: ExamTicketPayload = {
    ...payload,
    issuedAt,
    expiresAt,
  };

  const jsonStr = JSON.stringify(data);
  const base64Data = Buffer.from(jsonStr).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SIGNING_SECRET)
    .update(base64Data)
    .digest('base64url');

  return `${base64Data}.${signature}`;
}

/**
 * Validates the cryptographically signed ticket token
 */
export function verifyExamTicket(ticketToken: string): ExamTicketPayload | null {
  try {
    const parts = ticketToken.split('.');
    if (parts.length !== 2) return null;

    const [base64Data, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', SIGNING_SECRET)
      .update(base64Data)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return null;
    }

    const jsonStr = Buffer.from(base64Data, 'base64url').toString('utf8');
    const payload = JSON.parse(jsonStr) as ExamTicketPayload;

    // Check expiration
    if (Date.now() > payload.expiresAt) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
