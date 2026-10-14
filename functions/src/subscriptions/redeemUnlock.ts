/**
 * Not exported from functions/src/index.ts and not deployed.
 * When the owner approves a functions deploy, the callable must run decideUnlock
 * from src/subscriptions/unlockLedger.ts inside a Firestore transaction and must
 * read the clock from the server. Clients cannot create report_unlocks documents.
 */
export const REDEEM_UNLOCK_DEPLOYED = false;
