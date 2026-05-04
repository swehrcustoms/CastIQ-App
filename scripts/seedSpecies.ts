import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID });
}

const db = getFirestore();

const SPECIES = [
  {
    speciesId: 'walleye',
    commonName: 'Walleye',
    scientificName: 'Sander vitreus',
    habitatType: ['open water', 'weedline', 'structure', 'rocky points'],
    depthRangeMin: 5,
    depthRangeMax: 25,
    spawnSeason: 'spring',
    spawnTempF: 45,
    feedingPattern: 'crepuscular — most active at dawn and dusk',
    preferredLures: ['jig', 'jigging rap', 'crankbait', 'crawler harness'],
    preferredColors: ['chartreuse', 'gold', 'white', 'orange'],
    iconUrl: '',
    seasonActivity: { spring: 'high', summer: 'medium', fall: 'high', ice: 'medium' },
  },
  {
    speciesId: 'largemouth_bass',
    commonName: 'Largemouth Bass',
    scientificName: 'Micropterus salmoides',
    habitatType: ['weeds', 'shallow structure', 'docks', 'laydowns'],
    depthRangeMin: 2,
    depthRangeMax: 12,
    spawnSeason: 'spring',
    spawnTempF: 62,
    feedingPattern: 'ambush predator — targets shallow cover',
    preferredLures: ['soft plastics', 'topwater', 'jig', 'crankbait', 'spinnerbait'],
    preferredColors: ['green pumpkin', 'black blue', 'watermelon', 'white'],
    iconUrl: '',
    seasonActivity: { spring: 'high', summer: 'high', fall: 'medium', ice: 'low' },
  },
  {
    speciesId: 'smallmouth_bass',
    commonName: 'Smallmouth Bass',
    scientificName: 'Micropterus dolomieu',
    habitatType: ['rocky points', 'gravel', 'deep structure', 'open water'],
    depthRangeMin: 5,
    depthRangeMax: 20,
    spawnSeason: 'spring',
    spawnTempF: 60,
    feedingPattern: 'aggressive chaser — open-water and structure oriented',
    preferredLures: ['drop shot', 'tube jig', 'crankbait', 'ned rig', 'swimbait'],
    preferredColors: ['smoke', 'green pumpkin', 'natural shad', 'brown'],
    iconUrl: '',
    seasonActivity: { spring: 'high', summer: 'high', fall: 'high', ice: 'low' },
  },
  {
    speciesId: 'northern_pike',
    commonName: 'Northern Pike',
    scientificName: 'Esox lucius',
    habitatType: ['weeds', 'shallow bays', 'weedlines', 'river backwaters'],
    depthRangeMin: 4,
    depthRangeMax: 15,
    spawnSeason: 'spring',
    spawnTempF: 42,
    feedingPattern: 'ambush predator — lurks in weeds',
    preferredLures: ['large spinnerbait', 'sucker minnow', 'large jerkbait', 'muskie bucktail'],
    preferredColors: ['firetiger', 'white', 'chartreuse', 'silver'],
    iconUrl: '',
    seasonActivity: { spring: 'high', summer: 'medium', fall: 'high', ice: 'medium' },
  },
  {
    speciesId: 'muskie',
    commonName: 'Muskellunge',
    scientificName: 'Esox masquinongy',
    habitatType: ['weedlines', 'open water', 'structure', 'points'],
    depthRangeMin: 5,
    depthRangeMax: 20,
    spawnSeason: 'spring',
    spawnTempF: 55,
    feedingPattern: 'apex predator — follows baits and strikes at boat (figure-8)',
    preferredLures: ['large bucktail', 'glider', 'jerkbait', 'large crankbait', 'topwater'],
    preferredColors: ['perch', 'black', 'white', 'tiger'],
    iconUrl: '',
    seasonActivity: { spring: 'low', summer: 'medium', fall: 'high', ice: 'none' },
  },
  {
    speciesId: 'panfish',
    commonName: 'Bluegill / Sunfish',
    scientificName: 'Lepomis macrochirus',
    habitatType: ['weeds', 'docks', 'shallow structure', 'spawning beds'],
    depthRangeMin: 3,
    depthRangeMax: 10,
    spawnSeason: 'spring',
    spawnTempF: 65,
    feedingPattern: 'opportunistic — feeds throughout day',
    preferredLures: ['small jig', 'waxworm', 'cricket', 'small tube', 'fly'],
    preferredColors: ['pink', 'white', 'yellow', 'chartreuse'],
    iconUrl: '',
    seasonActivity: { spring: 'high', summer: 'high', fall: 'medium', ice: 'high' },
  },
  {
    speciesId: 'crappie',
    commonName: 'Crappie',
    scientificName: 'Pomoxis nigromaculatus',
    habitatType: ['timber', 'brush piles', 'docks', 'deep weeds'],
    depthRangeMin: 8,
    depthRangeMax: 20,
    spawnSeason: 'spring',
    spawnTempF: 60,
    feedingPattern: 'schooling — suspends at structure depth',
    preferredLures: ['small jig', 'tube', 'minnow', 'small swimbait'],
    preferredColors: ['white', 'chartreuse', 'pink', 'black'],
    iconUrl: '',
    seasonActivity: { spring: 'high', summer: 'medium', fall: 'medium', ice: 'high' },
  },
  {
    speciesId: 'yellow_perch',
    commonName: 'Yellow Perch',
    scientificName: 'Perca flavescens',
    habitatType: ['open water', 'sand flats', 'weedlines', 'deep basins'],
    depthRangeMin: 10,
    depthRangeMax: 30,
    spawnSeason: 'spring',
    spawnTempF: 44,
    feedingPattern: 'schooling — follows bait fish schools',
    preferredLures: ['small jig', 'minnow', 'jigging spoon', 'small crankbait'],
    preferredColors: ['white', 'yellow', 'orange', 'silver'],
    iconUrl: '',
    seasonActivity: { spring: 'high', summer: 'medium', fall: 'high', ice: 'high' },
  },
  {
    speciesId: 'lake_trout',
    commonName: 'Lake Trout',
    scientificName: 'Salvelinus namaycush',
    habitatType: ['deep basins', 'cold thermoclines', 'rocky structure'],
    depthRangeMin: 20,
    depthRangeMax: 80,
    spawnSeason: 'fall',
    spawnTempF: 48,
    feedingPattern: 'deepwater predator — follows ciscos and smelt',
    preferredLures: ['tube jig', 'jigging spoon', 'live minnow', 'flutter spoon'],
    preferredColors: ['white', 'silver', 'natural', 'blue'],
    iconUrl: '',
    seasonActivity: { spring: 'medium', summer: 'low', fall: 'high', ice: 'high' },
  },
  {
    speciesId: 'tulibee',
    commonName: 'Tulibee / Cisco',
    scientificName: 'Coregonus artedi',
    habitatType: ['open water', 'deepwater', 'cold basins'],
    depthRangeMin: 20,
    depthRangeMax: 60,
    spawnSeason: 'fall',
    spawnTempF: 34,
    feedingPattern: 'filter feeder + invertivore — schools in deep cold water',
    preferredLures: ['small jig', 'tungsten teardrop', 'small spoon'],
    preferredColors: ['glow', 'silver', 'pink', 'white'],
    iconUrl: '',
    seasonActivity: { spring: 'low', summer: 'low', fall: 'medium', ice: 'high' },
  },
];

async function seedSpecies(): Promise<void> {
  console.log(`Seeding ${SPECIES.length} species...`);
  const batch = db.batch();

  for (const species of SPECIES) {
    const ref = db.collection('species_registry').doc(species.speciesId);
    batch.set(ref, species, { merge: true });
  }

  await batch.commit();
  console.log(`✓ ${SPECIES.length} species seeded`);
}

seedSpecies().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
