import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

let cachedApp = null;

function readCredentials() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

  // Strip surrounding quotes if present
  if (privateKey?.startsWith('"') && privateKey?.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }

  // Replace both \n and \r\n with actual newlines
  privateKey = privateKey?.replace(/\\r\\n|\\n/g, '\n');

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
