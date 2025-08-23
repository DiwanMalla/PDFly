// src/lib/indexeddb-utils.ts
import { openDB } from "idb";

const DB_NAME = "pdfly-db";
const STORE_NAME = "pdf-files";

export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

export async function savePDFFile(key: string, file: Blob | ArrayBuffer) {
  const db = await getDB();
  await db.put(STORE_NAME, file, key);
}

export async function getPDFFile(
  key: string
): Promise<Blob | ArrayBuffer | undefined> {
  const db = await getDB();
  return db.get(STORE_NAME, key);
}

export async function deletePDFFile(key: string) {
  const db = await getDB();
  await db.delete(STORE_NAME, key);
}
