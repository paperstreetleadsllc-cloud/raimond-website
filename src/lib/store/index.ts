import { FileStore } from "./file-store";
import { SupabaseStore } from "./supabase-store";
import { StoreNotConfiguredError, type AuditStore } from "./types";

let store: AuditStore | null = null;

export function getStore(): AuditStore {
  if (store) return store;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    store = new SupabaseStore(url, key);
  } else if (process.env.VERCEL) {
    // Serverless filesystems are not persistent; refuse to pretend audits are saved.
    throw new StoreNotConfiguredError();
  } else {
    store = new FileStore();
  }
  return store;
}

/** Test hook. */
export function setStore(next: AuditStore | null) {
  store = next;
}

export * from "./types";
