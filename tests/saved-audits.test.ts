import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { listSavedAudits, saveAuditForUser } from "@/lib/service";
import { setStore } from "@/lib/store";
import { FileStore } from "@/lib/store/file-store";
import type { AuditRecord } from "@/lib/store";

const USER_A = "11111111-1111-4111-8111-111111111111";
const USER_B = "22222222-2222-4222-8222-222222222222";
const audit = (id: string, site: string): AuditRecord => ({
  id, siteKey: site, inputUrl: `https://${site}/`, status: "queued", progress: null, result: null, error: null,
  ipHash: "x", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
});

let dir: string;
let store: FileStore;
beforeEach(async () => {
  dir = await mkdtemp(path.join(os.tmpdir(), "raimond-saved-"));
  store = new FileStore(dir);
  setStore(store);
  await store.createAudit(audit("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", "one.example"));
  await store.createAudit(audit("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", "two.example"));
});
afterEach(async () => {
  setStore(null);
  await rm(dir, { recursive: true, force: true });
});

describe("saved audits", () => {
  it("lists only the audits a user saved, newest first", async () => {
    await saveAuditForUser(USER_A, "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    await saveAuditForUser(USER_A, "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb");
    await saveAuditForUser(USER_B, "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    expect((await listSavedAudits(USER_A)).map((a) => a.site)).toEqual(["two.example", "one.example"]);
    expect((await listSavedAudits(USER_B)).map((a) => a.site)).toEqual(["one.example"]);
  });

  it("saving the same audit twice keeps one entry", async () => {
    await saveAuditForUser(USER_A, "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    await saveAuditForUser(USER_A, "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    expect(await listSavedAudits(USER_A)).toHaveLength(1);
  });

  it("a storage failure does not throw", async () => {
    setStore({ ...store, saveUserAudit: async () => { throw new Error("table missing"); } } as never);
    expect(await saveAuditForUser(USER_A, "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa")).toBe(false);
  });
});
