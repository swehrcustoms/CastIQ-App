# CastIQ

Minnesota lake intelligence platform (Vite + React + Firebase + Claude).

## Quick start (local)

```bash
cp .env.example .env
# Fill VITE_FIREBASE_* and VITE_MAPBOX_ACCESS_TOKEN

npm install
npm run dev
```

## Secrets (Cloud Functions — never put these in Vite)

```bash
firebase functions:secrets:set ANTHROPIC_API_KEY
firebase functions:secrets:set TOMORROW_IO_API_KEY
```

## Seed + provision a guide tester

```bash
export FIREBASE_PROJECT_ID=castiq-app
# export GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json

npm run seed:all
npm run create:guide -- --email guide@example.com --password 'TempPass123!' --name "Northwoods Outfitters"
```

## Deploy

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
npm run deploy:functions
npm run deploy:hosting
```

See the Desktop checklist `CastIQ-Pre-Portal-Launch-Checklist.md` for the full launch order.
