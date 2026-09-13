import type { Profile } from '../core/types';
import {
  journalPrefix,
  profileKey,
  readCheckpoints,
  type StoragePort,
  validateProfile,
} from './storage';
export type SaveResult =
  | { ok: true }
  | { ok: false; reason: 'conflict' | 'unavailable' | 'checkpoint' };
export type Exclusive = <T>(job: () => T) => Promise<T>;
let database: Promise<IDBDatabase> | undefined;
function localDatabase(): Promise<IDBDatabase> {
  if (database) return database;
  database = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(Error('No serialisation primitive'));
      return;
    }
    const request = indexedDB.open('battlevox-save-lock', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('mutex');
    request.onsuccess = () => {
      request.result.onversionchange = () => {
        request.result.close();
        database = undefined;
      };
      resolve(request.result);
    };
    request.onerror = () => {
      database = undefined;
      reject(request.error);
    };
    request.onblocked = () => {
      database = undefined;
      reject(Error('Save database upgrade blocked'));
    };
  });
  return database;
}
/** Both Web Locks and IDB readwrite transactions serialize same-origin writers.
 * The callback is synchronous: localStorage CAS happens while the exclusive lock is held. */
export const exclusiveProfileWrite: Exclusive = async <T>(job: () => T): Promise<T> => {
  if (typeof navigator !== 'undefined' && navigator.locks)
    return navigator.locks.request('battlevox-profile-write', job);
  const db = await localDatabase();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction('mutex', 'readwrite');
    let result: T,
      done = false;
    const request = tx.objectStore('mutex').get('lock');
    request.onsuccess = () => {
      try {
        result = job();
        done = true;
        tx.objectStore('mutex').put(Date.now(), 'lock');
      } catch (e) {
        tx.abort();
        reject(e);
      }
    };
    tx.oncomplete = () =>
      done ? resolve(result) : reject(Error('Save transaction did not execute'));
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error ?? Error('Save transaction aborted'));
  });
};
export class ProfileSession {
  private expected: string | null;
  readonly journalKey: string;
  constructor(
    private storage: StoragePort | null,
    base: string | null,
    private exclusive: Exclusive = exclusiveProfileWrite,
  ) {
    this.expected = base;
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    this.journalKey = journalPrefix + id;
  }
  /** A per-session checkpoint is synchronous, including during pagehide/unload. */
  checkpoint(profile: Profile): boolean {
    try {
      if (!this.storage) return false;
      this.storage.setItem(
        this.journalKey,
        JSON.stringify({
          base: this.expected,
          profile: validateProfile(profile),
          updatedAt: Date.now(),
        }),
      );
      return true;
    } catch {
      return false;
    }
  }
  async commit(profile: Profile): Promise<SaveResult> {
    const value = JSON.stringify(validateProfile(profile));
    const journalled = this.checkpoint(profile);
    if (!this.storage) return { ok: false, reason: 'unavailable' };
    try {
      return await this.exclusive(() => {
        const current = this.storage!.getItem(profileKey);
        if (current !== this.expected) return { ok: false, reason: 'conflict' } as const;
        this.storage!.setItem(profileKey, value);
        this.expected = value;
        // A checkpoint written while the lock was queued may contain newer XP.
        try {
          const pending = JSON.parse(this.storage!.getItem(this.journalKey) ?? 'null');
          if (pending && JSON.stringify(pending.profile) === value)
            this.storage!.removeItem?.(this.journalKey);
          else if (pending) {
            pending.base = value;
            this.storage!.setItem(this.journalKey, JSON.stringify(pending));
          }
        } catch {
          /* Canonical data was saved; keep an unreadable journal for recovery. */
        }
        return { ok: true } as const;
      });
    } catch {
      return { ok: false, reason: journalled ? 'checkpoint' : 'unavailable' };
    }
  }
  checkpoints() {
    return readCheckpoints(this.storage);
  }
}
