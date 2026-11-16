import { promises as fs } from "node:fs";
import path from "node:path";
import type { AuditRecord, AuditStore, LeadInput } from "./types";

/**
 * Local-development store: one JSON file per audit under .data/.
 * Never used on Vercel, where the filesystem is not persistent.
 */
export class FileStore implements AuditStore {
  constructor(private dir = path.join(process.cwd(), ".data")) {}

  private file(id: string) {
    if (!/^[0-9a-f-]{36}$/.test(id)) throw new Error("Invalid audit id");
    return path.join(this.dir, "audits", `${id}.json`);
  }

  private async all(): Promise<AuditRecord[]> {
    const dir = path.join(this.dir, "audits");
    const names = await fs.readdir(dir).catch(() => [] as string[]);
    const records = await Promise.all(
      names.filter((n) => n.endsWith(".json")).map(async (n) => {
        try {
          return JSON.parse(await fs.readFile(path.join(dir, n), "utf8")) as AuditRecord;
        } catch {
          return null;
        }
      }),
    );
    return records.filter((r): r is AuditRecord => r !== null);
  }

  async createAudit(record: AuditRecord) {
    await fs.mkdir(path.join(this.dir, "audits"), { recursive: true });
    await fs.writeFile(this.file(record.id), JSON.stringify(record));
  }

  async updateAudit(id: string, patch: Partial<AuditRecord>) {
    const current = await this.getAudit(id);
    if (!current) return;
    const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
    const tmp = `${this.file(id)}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(next));
    await fs.rename(tmp, this.file(id));
  }

  async getAudit(id: string) {
    try {
      return JSON.parse(await fs.readFile(this.file(id), "utf8")) as AuditRecord;
    } catch {
      return null;
    }
  }

  async findRecentBySite(siteKey: string, sinceIso: string) {
    const matches = (await this.all())
      .filter((r) => r.siteKey === siteKey && r.createdAt >= sinceIso && r.status !== "failed")
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return matches[0] ?? null;
  }

  async countByIpSince(ipHash: string, sinceIso: string) {
    return (await this.all()).filter((r) => r.ipHash === ipHash && r.createdAt >= sinceIso).length;
  }

  async countSince(sinceIso: string) {
    return (await this.all()).filter((r) => r.createdAt >= sinceIso).length;
  }

  async saveLead(lead: LeadInput) {
    await fs.mkdir(this.dir, { recursive: true });
    await fs.appendFile(path.join(this.dir, "leads.jsonl"), `${JSON.stringify({ ...lead, createdAt: new Date().toISOString() })}\n`);
  }

  private linksFile() {
    return path.join(this.dir, "user-audits.jsonl");
  }

  private async links(): Promise<{ userId: string; auditId: string; createdAt: string }[]> {
    const raw = await fs.readFile(this.linksFile(), "utf8").catch(() => "");
    return raw.split("\n").filter(Boolean).map((line) => JSON.parse(line));
  }

  async saveUserAudit(userId: string, auditId: string) {
    if ((await this.links()).some((l) => l.userId === userId && l.auditId === auditId)) return;
    await fs.mkdir(this.dir, { recursive: true });
    await fs.appendFile(this.linksFile(), `${JSON.stringify({ userId, auditId, createdAt: new Date().toISOString() })}\n`);
  }

  async listUserAudits(userId: string, limit: number) {
    const mine = (await this.links()).filter((l) => l.userId === userId).reverse().slice(0, limit);
    const records = await Promise.all(mine.map((l) => this.getAudit(l.auditId)));
    return records.filter((r): r is AuditRecord => r !== null);
  }
}
