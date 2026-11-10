/**
 * Minimal IndexedDB helper for screenshot attachments.
 * Images never leave the browser; nothing is uploaded anywhere.
 */

export interface StoredScreenshot {
  name: string;
  type: string;
  blob: Blob;
}

interface ScreenshotRecord {
  key: string;
  files: StoredScreenshot[];
}

function openDb(dbName: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is unavailable in this browser'));
      return;
    }
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains('screenshots')) {
        request.result.createObjectStore('screenshots', { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open IndexedDB'));
  });
}

export async function saveScreenshots(dbName: string, key: string, files: File[]): Promise<void> {
  const db = await openDb(dbName);
  return new Promise((resolve, reject) => {
    const tx = db.transaction('screenshots', 'readwrite');
    const record: ScreenshotRecord = {
      key,
      files: files.map((file) => ({ name: file.name, type: file.type, blob: file })),
    };
    tx.objectStore('screenshots').put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Could not save screenshots'));
  });
}

export async function loadScreenshots(dbName: string, key: string): Promise<StoredScreenshot[]> {
  const db = await openDb(dbName);
  return new Promise((resolve, reject) => {
    const tx = db.transaction('screenshots', 'readonly');
    const request = tx.objectStore('screenshots').get(key);
    request.onsuccess = () => resolve(((request.result as ScreenshotRecord | undefined)?.files ?? []) as StoredScreenshot[]);
    request.onerror = () => reject(request.error ?? new Error('Could not load screenshots'));
  });
}

/** Shared validation for the PNG/JPG/WebP, max 4 files, 8 MB each rule. */
export function validateScreenshotFiles(files: File[]): string | null {
  const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
  if (files.length > 4) return 'Choose up to 4 images.';
  if (files.some((file) => !validTypes.includes(file.type) || file.size > 8 * 1024 * 1024)) {
    return 'Choose PNG, JPG, or WebP images, no larger than 8 MB each.';
  }
  return null;
}
