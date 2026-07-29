/**
 * Provision a Guide Portal user.
 *
 * Creates or fetches a Firebase Auth user, sets custom claims, writes
 * `users/{uid}` and `guide_portal_users/{uid}`.
 *
 * Usage:
 *   FIREBASE_PROJECT_ID=castiq-app npx tsx scripts/createGuideUser.ts \
 *     --email guide@example.com \
 *     --password 'TempPass123!' \
 *     --name "Northwoods Outfitters" \
 *     --lakes 48-0259-00,11-0182-00,LOTW-MN
 *
 * If the Auth user already exists, password is ignored and the account is upgraded to guide.
 */

import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID ?? 'castiq-app' });
}

const auth = getAuth();
const db = getFirestore();

function arg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

async function main(): Promise<void> {
  const email = arg('--email');
  const password = arg('--password') ?? 'CastIQ-Guide-ChangeMe1';
  const businessName = arg('--name') ?? 'CastIQ Guide';
  const displayName = arg('--displayName') ?? businessName;
  const lakesRaw = arg('--lakes') ?? '48-0259-00,11-0182-00,LOTW-MN';
  const primaryLakeIds = lakesRaw.split(',').map((s) => s.trim()).filter(Boolean);

  if (!email) {
    console.error(
      'Usage: tsx scripts/createGuideUser.ts --email guide@example.com [--password ...] [--name ...] [--lakes id1,id2]'
    );
    process.exit(1);
  }

  let uid: string;
  let created = false;

  try {
    const existing = await auth.getUserByEmail(email);
    uid = existing.uid;
    console.log(`Found existing Auth user ${uid}`);
  } catch {
    const createdUser = await auth.createUser({
      email,
      password,
      displayName,
      emailVerified: true,
    });
    uid = createdUser.uid;
    created = true;
    console.log(`Created Auth user ${uid}`);
  }

  await auth.setCustomUserClaims(uid, { guide: true, role: 'guide' });
  console.log('✓ Custom claims set: { guide: true, role: "guide" }');

  const now = Timestamp.now();
  await db.collection('users').doc(uid).set(
    {
      uid,
      email,
      displayName,
      photoURL: null,
      role: 'guide',
      favoriteLakeIds: primaryLakeIds,
      alertPreferences: {
        species: ['walleye', 'muskie'],
        reportRecency: true,
        winterkillAlerts: true,
        iceReports: true,
      },
      submittedReportIds: [],
      guidePortalAccess: true,
      createdAt: now,
      updatedAt: FieldValue.serverTimestamp(),
      lastLoginAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
  console.log(`✓ users/${uid} updated (guidePortalAccess: true)`);

  await db.collection('guide_portal_users').doc(uid).set(
    {
      guideId: uid,
      userId: uid,
      businessName,
      licenseNumber: 'PENDING',
      primaryLakeIds,
      targetSpecies: ['walleye', 'muskie', 'smallmouth_bass'],
      subscriptionTier: 'pro',
      apiAccessEnabled: false,
      apiKey: null,
      dashboardPreferences: { defaultSpecies: 'walleye' },
      createdAt: now,
    },
    { merge: true }
  );
  console.log(`✓ guide_portal_users/${uid} written`);

  console.log('\nDone. Share with the tester:');
  console.log(`  Email:    ${email}`);
  if (created) console.log(`  Password: ${password}`);
  else console.log('  Password: (existing account — use their current password or reset)');
  console.log('  Portal:   /guide after signing in');
  console.log('  Lakes:    ' + primaryLakeIds.join(', '));
}

main().catch((err) => {
  console.error('createGuideUser failed:', err);
  process.exit(1);
});
