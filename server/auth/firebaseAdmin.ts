import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let firebaseAdminApp: App | null = null;
let isInitialized = false;

export function initializeFirebaseAdmin(): App | null {
  if (isInitialized) {
    return firebaseAdminApp;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    // Handle escaped newlines from environment variables
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  if (projectId && clientEmail && privateKey) {
    try {
      if (getApps().length === 0) {
        firebaseAdminApp = initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
      } else {
        firebaseAdminApp = getApps()[0];
      }
      isInitialized = true;
      console.log(`[Firebase Admin] Initialized successfully for project: ${projectId}`);
      return firebaseAdminApp;
    } catch (err) {
      console.warn('[Firebase Admin] Initialization failed with provided credentials:', err);
    }
  } else {
    // Attempt default application credentials
    try {
      if (getApps().length === 0) {
        firebaseAdminApp = initializeApp();
      } else {
        firebaseAdminApp = getApps()[0];
      }
      isInitialized = true;
      console.log('[Firebase Admin] Initialized with Application Default Credentials');
      return firebaseAdminApp;
    } catch {
      console.log('[Firebase Admin] Running in standalone/fallback auth mode. (Configure FIREBASE_* environment variables for live Firebase verification)');
    }
  }

  return null;
}

export async function verifyFirebaseIdToken(token: string) {
  const adminApp = initializeFirebaseAdmin();
  if (!adminApp) {
    // Standalone fallback mode for dev/demo testing
    if (token.startsWith('demo-') || token.includes('student') || token.includes('teacher') || token.includes('admin')) {
      return {
        uid: token.includes('teacher') ? 'teacher-demo-1' : token.includes('admin') ? 'admin-super-1' : 'student-demo-1',
        email: token.includes('teacher') ? 'teacher@ioe.msdieu.com' : token.includes('admin') ? 'admin@ioe.msdieu.com' : 'student@ioe.msdieu.com',
        name: token.includes('teacher') ? 'Cô Hoàng Thu Thảo (Giáo viên)' : token.includes('admin') ? 'Quản trị viên IOE' : 'Nguyễn Minh Anh (Học sinh)',
        picture: undefined,
      };
    }
    return null;
  }

  try {
    const auth = getAuth(adminApp);
    const decoded = await auth.verifyIdToken(token);
    return decoded;
  } catch (err) {
    console.warn('[Firebase Admin] Token verification failed:', err);
    return null;
  }
}
