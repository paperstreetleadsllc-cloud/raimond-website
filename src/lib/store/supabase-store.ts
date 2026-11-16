import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AuditRecord, AuditStore, LeadInput } from "./types";

interface Row {
  id: string;
  site_key: string;
  input_url: string;
  status: AuditRecord["status"];
  progress: AuditRecord["progress"];
  result: AuditRecord["result"];
  error: AuditRecord["error"];
  ip_hash: string;
  created_at: string;
  updated_at: string;
}

const toRecord = (r: Row): AuditRecord => ({
  id: r.id,
  siteKey: r.site_key,
  inputUrl: r.input_url,
  status: r.status,
  progress: r.progress,
  result: r.result,
  error: r.error,
  ipHash: r.ip_hash,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

/**
 * Production store. Uses the service-role key on the server only; the tables
 * have row-level security enabled with no public policies, so the browser can
 * never read them directly.
 */
export class SupabaseStore implements AuditStore {
  private db: SupabaseClient;

  constructor(url: string, serviceRoleKey: string) {
    this.db = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  }

  async createAudit(record: AuditRecord) {
    const { error } = await this.db.from("audits").insert({
      id: record.id,
      site_key: record.siteKey,
      input_url: record.inputUrl,
      status: record.status,
      progress: record.progress,
      result: record.result,
      error: record.error,
      ip_hash: record.ipHash,
    });
    if (error) throw new Error(`createAudit failed: ${error.message}`);
  }

  async updateAudit(id: string, patch: Partial<AuditRecord>) {
    const { error } = await this.db
      .from("audits")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(`updateAudit failed: ${error.message}`);
  }

  async getAudit(id: string) {
    const { data, error } = await this.db.from("audits").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(`getAudit failed: ${error.message}`);
    return data ? toRecord(data as Row) : null;
  }

  async findRecentBySite(siteKey: string, sinceIso: string) {
    const { data, error } = await this.db
      .from("audits")
      .select("*")
      .eq("site_key", siteKey)
      .neq("status", "failed")
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false })
      .limit(1);
    if (error) throw new Error(`findRecentBySite failed: ${error.message}`);
    return data?.[0] ? toRecord(data[0] as Row) : null;
  }

  async countByIpSince(ipHash: string, sinceIso: string) {
    const { count, error } = await this.db
      .from("audits")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", sinceIso);
    if (error) throw new Error(`countByIpSince failed: ${error.message}`);
    return count ?? 0;
  }

  async countSince(sinceIso: string) {
    const { count, error } = await this.db
      .from("audits")
      .select("id", { count: "exact", head: true })
      .gte("created_at", sinceIso);
    if (error) throw new Error(`countSince failed: ${error.message}`);
    return count ?? 0;
  }

  async saveLead(lead: LeadInput) {
    const { error } = await this.db.from("audit_leads").upsert({
      audit_id: lead.auditId,
      email: lead.email,
      name: lead.name,
      ip_hash: lead.ipHash,
    }, { onConflict: "audit_id,email", ignoreDuplicates: true });
    if (error) throw new Error(`saveLead failed: ${error.message}`);
  }
}
