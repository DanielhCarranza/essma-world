import { LOCAL_PROFILE_ID, PlayerProfile, validateAndMigrateProfile } from "./player-profile.js";

const DB_NAME = "essma-world";
const STORE_NAME = "profiles";

function openProfileDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function readSavedProfile(): Promise<PlayerProfile | null> {
  const db = await openProfileDb();
  const stored = await new Promise<unknown>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(LOCAL_PROFILE_ID);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  if (stored === undefined) return null;
  const result = validateAndMigrateProfile(stored);
  return result.ok ? result.profile : null;
}

export async function writeSavedProfile(profile: PlayerProfile): Promise<void> {
  const result = validateAndMigrateProfile(profile);
  if (!result.ok) throw new Error(`Refusing to save an invalid profile: ${result.reason}`);
  const db = await openProfileDb();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(result.profile, LOCAL_PROFILE_ID);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}
