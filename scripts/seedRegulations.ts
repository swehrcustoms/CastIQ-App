import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID });
}

const db = getFirestore();

// 2026 MN statewide defaults — key species
const STATEWIDE_DEFAULTS = [
  {
    defaultId: 'walleye_statewide_2026',
    species: 'walleye',
    year: 2026,
    zone: null,
    openDate: '2026-05-09',
    closeDate: null,
    dailyLimit: 6,
    minSizeIn: 15,
    slotLimitLowIn: null,
    slotLimitHighIn: null,
    gearNotes: null,
  },
  {
    defaultId: 'northern_pike_statewide_2026',
    species: 'northern_pike',
    year: 2026,
    zone: null,
    openDate: '2026-01-01',
    closeDate: null,
    dailyLimit: 3,
    minSizeIn: 24,
    slotLimitLowIn: null,
    slotLimitHighIn: null,
    gearNotes: null,
  },
  {
    defaultId: 'largemouth_bass_statewide_2026',
    species: 'largemouth_bass',
    year: 2026,
    zone: null,
    openDate: '2026-05-09',
    closeDate: null,
    dailyLimit: 6,
    minSizeIn: 12,
    slotLimitLowIn: null,
    slotLimitHighIn: null,
    // Year-round C&R allowed outside harvest season
    gearNotes: 'Year-round catch-and-release allowed. Harvest season May 9 onward.',
  },
  {
    defaultId: 'smallmouth_bass_statewide_2026',
    species: 'smallmouth_bass',
    year: 2026,
    zone: null,
    openDate: '2026-05-09',
    closeDate: null,
    dailyLimit: 6,
    minSizeIn: 12,
    slotLimitLowIn: null,
    slotLimitHighIn: null,
    gearNotes: 'Year-round catch-and-release allowed. Harvest season May 9 onward.',
  },
  {
    defaultId: 'muskie_statewide_2026',
    species: 'muskie',
    year: 2026,
    zone: null,
    openDate: '2026-06-07',
    closeDate: '2026-11-30',
    dailyLimit: 1,
    minSizeIn: 54,
    slotLimitLowIn: null,
    slotLimitHighIn: null,
    gearNotes: null,
  },
  {
    defaultId: 'panfish_statewide_2026',
    species: 'panfish',
    year: 2026,
    zone: null,
    openDate: '2026-01-01',
    closeDate: null,
    dailyLimit: 20,
    minSizeIn: null,
    slotLimitLowIn: null,
    slotLimitHighIn: null,
    gearNotes: null,
  },
  {
    defaultId: 'crappie_statewide_2026',
    species: 'crappie',
    year: 2026,
    zone: null,
    openDate: '2026-01-01',
    closeDate: null,
    dailyLimit: 10,
    minSizeIn: null,
    slotLimitLowIn: null,
    slotLimitHighIn: null,
    gearNotes: null,
  },
  {
    defaultId: 'yellow_perch_statewide_2026',
    species: 'yellow_perch',
    year: 2026,
    zone: null,
    openDate: '2026-01-01',
    closeDate: null,
    dailyLimit: 50,
    minSizeIn: null,
    slotLimitLowIn: null,
    slotLimitHighIn: null,
    gearNotes: null,
  },
  {
    defaultId: 'lake_trout_statewide_2026',
    species: 'lake_trout',
    year: 2026,
    zone: null,
    openDate: '2026-01-14',
    closeDate: '2026-10-31',
    dailyLimit: 3,
    minSizeIn: 15,
    slotLimitLowIn: null,
    slotLimitHighIn: null,
    gearNotes: null,
  },
  {
    defaultId: 'stream_trout_statewide_2026',
    species: 'stream_trout',
    year: 2026,
    zone: null,
    // Permanently 2nd Saturday in April (2026 = April 11)
    openDate: '2026-04-11',
    closeDate: '2026-10-31',
    dailyLimit: 5,
    minSizeIn: 8,
    slotLimitLowIn: null,
    slotLimitHighIn: null,
    gearNotes: null,
  },
];

// Border waters regulation summary
const BORDER_WATERS = [
  {
    borderId: 'LOTW',
    waterName: 'Lake of the Woods',
    jurisdictions: ['MN', 'ON', 'MB'],
    mnRegRef: 'walleye_statewide_2026',
    partnerRegText: 'Ontario: 4 walleye daily limit, 18-inch minimum size. Manitoba: 4 walleye daily limit.',
    mnDailyLimit: { walleye: 6, northern_pike: 3 },
    partnerDailyLimit: { walleye: 4, northern_pike: 6 },
    mnMinSizeIn: { walleye: 15 },
    partnerMinSizeIn: { walleye: 18 },
    licenseRequired: ['MN', 'ON'],
    treatyNotes: 'Red Lake Band treaty rights apply in certain portions.',
    conflictFlags: ['walleye'],
    aiConflictSummary: 'Walleye regulations differ: MN allows 6/day at 15", Ontario allows 4/day at 18". Anglers should follow the more restrictive limit (4 fish, 18") when uncertain of jurisdiction.',
    lastUpdated: Timestamp.now(),
  },
  {
    borderId: 'RAINY_LAKE',
    waterName: 'Rainy Lake',
    jurisdictions: ['MN', 'ON'],
    mnRegRef: 'walleye_statewide_2026',
    partnerRegText: 'Ontario (FMZ 5): Walleye 4/day, 18" minimum.',
    mnDailyLimit: { walleye: 6 },
    partnerDailyLimit: { walleye: 4 },
    mnMinSizeIn: { walleye: 15 },
    partnerMinSizeIn: { walleye: 18 },
    licenseRequired: ['MN', 'ON'],
    treatyNotes: null,
    conflictFlags: ['walleye'],
    aiConflictSummary: 'Walleye size and bag limits differ between MN and Ontario. Use the more restrictive Ontario rules (4 fish, 18") when fishing Canadian waters.',
    lastUpdated: Timestamp.now(),
  },
];

const YEAR = 2026;

/** Lake-specific regs for Tier-1 demo lakes (queried by regulationLookupService). */
const LAKE_REGULATIONS = [
  {
    regId: 'mille-lacs-walleye-2026',
    lakeId: '48-0259-00',
    lakeIdDNR: '48-0259-00',
    county: 'Mille Lacs',
    year: YEAR,
    effectiveYear: YEAR,
    species: 'walleye',
    jurisdiction: 'MN',
    openDate: '2026-05-09',
    closeDate: null,
    dailyLimit: 4,
    possessionLimit: 4,
    conservationLicenseLimit: null,
    minSizeIn: 18,
    maxSizeIn: null,
    slotLimitLowIn: null,
    slotLimitHighIn: null,
    gearRestrictions: null,
    artificialOnly: false,
    catchAndReleaseOnly: false,
    tribalOverlap: true,
    tribalNotes: 'Mille Lacs Band treaty harvest may affect openers.',
    experimentalReg: true,
    specialNotes: 'Protected slot / experimental regs may apply — verify DNR before harvest.',
    alertLevel: 'warning' as const,
    sourceUrl: 'https://www.dnr.state.mn.us/regulations/fishing/index.html',
  },
  {
    regId: 'leech-walleye-2026',
    lakeId: '11-0182-00',
    lakeIdDNR: '11-0182-00',
    county: 'Cass',
    year: YEAR,
    effectiveYear: YEAR,
    species: 'walleye',
    jurisdiction: 'MN',
    openDate: '2026-05-09',
    closeDate: null,
    dailyLimit: 4,
    possessionLimit: 8,
    conservationLicenseLimit: null,
    minSizeIn: 15,
    maxSizeIn: null,
    slotLimitLowIn: 20,
    slotLimitHighIn: 26,
    gearRestrictions: null,
    artificialOnly: false,
    catchAndReleaseOnly: false,
    tribalOverlap: false,
    tribalNotes: null,
    experimentalReg: false,
    specialNotes: 'Only 1 walleye over 26" in possession.',
    alertLevel: 'info' as const,
    sourceUrl: 'https://www.dnr.state.mn.us/regulations/fishing/index.html',
  },
  {
    regId: 'lotw-walleye-2026',
    lakeId: 'LOTW-MN',
    lakeIdDNR: 'LOTW-MN',
    county: 'Lake of the Woods',
    year: YEAR,
    effectiveYear: YEAR,
    species: 'walleye',
    jurisdiction: 'MN',
    openDate: '2026-05-09',
    closeDate: null,
    dailyLimit: 6,
    possessionLimit: 6,
    conservationLicenseLimit: null,
    minSizeIn: 15,
    maxSizeIn: null,
    slotLimitLowIn: null,
    slotLimitHighIn: null,
    gearRestrictions: null,
    artificialOnly: false,
    catchAndReleaseOnly: false,
    tribalOverlap: false,
    tribalNotes: null,
    experimentalReg: false,
    specialNotes: 'Border water — Ontario limits differ. Carry correct licenses.',
    alertLevel: 'warning' as const,
    sourceUrl: 'https://www.dnr.state.mn.us/regulations/fishing/index.html',
  },
  {
    regId: 'vermilion-muskie-2026',
    lakeId: '69-0375-00',
    lakeIdDNR: '69-0375-00',
    county: 'St. Louis',
    year: YEAR,
    effectiveYear: YEAR,
    species: 'muskie',
    jurisdiction: 'MN',
    openDate: '2026-06-07',
    closeDate: '2026-11-30',
    dailyLimit: 1,
    possessionLimit: 1,
    conservationLicenseLimit: null,
    minSizeIn: 54,
    maxSizeIn: null,
    slotLimitLowIn: null,
    slotLimitHighIn: null,
    gearRestrictions: null,
    artificialOnly: false,
    catchAndReleaseOnly: false,
    tribalOverlap: false,
    tribalNotes: null,
    experimentalReg: false,
    specialNotes: null,
    alertLevel: null,
    sourceUrl: 'https://www.dnr.state.mn.us/regulations/fishing/index.html',
  },
];

async function seedRegulations(): Promise<void> {
  console.log(`Seeding ${STATEWIDE_DEFAULTS.length} statewide defaults...`);
  const batch = db.batch();
  const now = Timestamp.now();

  for (const reg of STATEWIDE_DEFAULTS) {
    const ref = db.collection('statewide_defaults').doc(reg.defaultId);
    batch.set(ref, { ...reg, lastUpdated: now }, { merge: true });
  }

  await batch.commit();
  console.log(`✓ ${STATEWIDE_DEFAULTS.length} statewide defaults seeded`);

  console.log(`Seeding ${BORDER_WATERS.length} border waters...`);
  const batch2 = db.batch();

  for (const bw of BORDER_WATERS) {
    const ref = db.collection('border_waters').doc(bw.borderId);
    batch2.set(ref, bw, { merge: true });
  }

  await batch2.commit();
  console.log(`✓ ${BORDER_WATERS.length} border waters seeded`);

  console.log(`Seeding ${LAKE_REGULATIONS.length} lake-specific regulations...`);
  const batch3 = db.batch();
  for (const reg of LAKE_REGULATIONS) {
    const ref = db.collection('regulations').doc(reg.regId);
    batch3.set(ref, reg, { merge: true });
  }
  await batch3.commit();
  console.log(`✓ ${LAKE_REGULATIONS.length} lake regulations seeded`);
}

seedRegulations().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
