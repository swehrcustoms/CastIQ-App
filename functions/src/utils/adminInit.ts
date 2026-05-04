import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

export const db = admin.firestore();
export const authAdmin = admin.auth();
export const storageAdmin = admin.storage();
export { admin };
