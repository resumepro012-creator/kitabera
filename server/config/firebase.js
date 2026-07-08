import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

let cachedApp = null;

function readCredentials() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

  if (!projectId || !clientEmail || !privateKey || !storageBucket) {
    return null;
  }

  return { projectId, clientEmail, privateKey, storageBucket };
}

function getFirebaseApp() {
  if (cachedApp) {
    return cachedApp;
  }

  const credentials = readCredentials();

  if (!credentials) {
    throw new Error(
      'Firebase is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, ' +
      'FIREBASE_PRIVATE_KEY and FIREBASE_STORAGE_BUCKET in your .env file (see SETUP_GUIDE.md).'
    );
  }

  if (getApps().length) {
    cachedApp = getApps()[0];
    return cachedApp;
  }

  cachedApp = initializeApp({
    credential: cert({
      projectId: credentials.projectId,
      clientEmail: credentials.clientEmail,
      privateKey: credentials.privateKey
    }),
    storageBucket: credentials.storageBucket
  });

  return cachedApp;
}

export function db() {
  return getFirestore(getFirebaseApp());
}

export function bucket() {
  return getStorage(getFirebaseApp()).bucket();
}
