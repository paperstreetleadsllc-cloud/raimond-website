import type { AuditProgress, AuditResult, AuditStatus } from "../audit/types";

export interface AuditRecord {
  id: string;
  siteKey: string;
  inputUrl: string;
  status: AuditStatus;
  progress: AuditProgress | null;
  result: AuditResult | null;
  error: { code: string; message: string } | null;
  ipHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadInput {
  auditId: string;
  email: string;
  name: string | null;
  ipHash: string;
}

export interface AuditStore {
  createAudit(record: AuditRecord): Promise<void>;
  updateAudit(id: string, patch: Partial<Pick<AuditRecord, "status" | "progress" | "result" | "error">>): Promise<void>;
  getAudit(id: string): Promise<AuditRecord | null>;
  /** Most recent audit for a site that is completed or still in progress. */
  findRecentBySite(siteKey: string, sinceIso: string): Promise<AuditRecord | null>;
  countByIpSince(ipHash: string, sinceIso: string): Promise<number>;
  countSince(sinceIso: string): Promise<number>;
  saveLead(lead: LeadInput): Promise<void>;
}

export class StoreNotConfiguredError extends Error {
  constructor() {
    super("Audit storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
    this.name = "StoreNotConfiguredError";
  }
}
