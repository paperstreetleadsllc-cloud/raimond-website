import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  AlertRecordSchema,
  ActionPlanSchema,
  AuditResultSchema,
  BillingCustomerSchema,
  ChunkSchema,
  CreateSiteInputSchema,
  CrawlResultSchema,
  DocumentSchema,
  RunHistoryEntrySchema,
  SiteSchema,
  type AlertRecord,
  type ActionPlan,
  type AuditResult,
  type BillingCustomer,
  type Chunk,
  type CreateSiteInput,
  type CrawlResult,
  type Document,
  type RunHistoryEntry,
  type Site,
} from "../domain/types.js";
import { defaultDataDir, ensureDataMigrations } from "./migrations.js";

type StoreFiles = {
  sites: string;
  audits: string;
  crawlResults: string;
  documents: string;
  chunks: string;
  billingCustomers: string;
  runHistory: string;
  alerts: string;
  actionPlans: string;
};

class InProcessMutex {
  private queue: Promise<unknown> = Promise.resolve();

  runExclusive<T>(task: () => Promise<T>): Promise<T> {
    const run = this.queue.then(task, task);
    this.queue = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }
}

export const stableHash = (value: string): string =>
  createHash("sha256").update(value).digest("hex").slice(0, 16);

export const buildStableId = (prefix: string, seed: string): string =>
  `${prefix}_${stableHash(seed)}`;

export type FileStoreOptions = {
  dataDir?: string;
};

export interface AeoStore {
  init(): Promise<void>;
  createSite(input: CreateSiteInput): Promise<Site>;
  listSites(): Promise<Site[]>;
  getSiteById(siteId: string): Promise<Site | null>;
  saveAudit(audit: AuditResult): Promise<AuditResult>;
  getLatestAudit(siteId: string): Promise<AuditResult | null>;
  saveActionPlan(plan: ActionPlan): Promise<ActionPlan>;
  getLatestActionPlan(siteId: string): Promise<ActionPlan | null>;
  saveCrawlArtifacts(input: {
    crawl: CrawlResult;
    documents: Document[];
    chunks: Chunk[];
  }): Promise<void>;
  saveRunHistory(entry: RunHistoryEntry): Promise<RunHistoryEntry>;
  listSiteHistory(siteId: string): Promise<RunHistoryEntry[]>;
  saveAlerts(alerts: AlertRecord[]): Promise<AlertRecord[]>;
  listAlerts(siteId?: string): Promise<AlertRecord[]>;
  listDocumentsBySiteId(siteId: string): Promise<Document[]>;
  getBillingCustomerByEmail(email: string): Promise<BillingCustomer | null>;
  upsertBillingCustomer(customer: BillingCustomer): Promise<BillingCustomer>;
  listActiveSubscribedSites(limit: number): Promise<Site[]>;
}

export class FileStore implements AeoStore {
  private readonly dataDir: string;
  private readonly files: StoreFiles;
  private readonly mutexes = new Map<string, InProcessMutex>();

  constructor(options: FileStoreOptions = {}) {
    this.dataDir = options.dataDir ?? defaultDataDir;
    this.files = {
      sites: path.join(this.dataDir, "sites.json"),
      audits: path.join(this.dataDir, "audits.json"),
      crawlResults: path.join(this.dataDir, "crawl-results.json"),
      documents: path.join(this.dataDir, "documents.json"),
      chunks: path.join(this.dataDir, "chunks.json"),
      billingCustomers: path.join(this.dataDir, "billing-customers.json"),
      runHistory: path.join(this.dataDir, "run-history.json"),
      alerts: path.join(this.dataDir, "alerts.json"),
      actionPlans: path.join(this.dataDir, "action-plans.json"),
    };
  }

  async init(): Promise<void> {
    await ensureDataMigrations(this.dataDir);
  }

  async createSite(input: CreateSiteInput): Promise<Site> {
    const sitePayload = CreateSiteInputSchema.parse(input);
    const createdAt = new Date().toISOString();

    const site: Site = {
      id: buildStableId("site", `${sitePayload.url}|${createdAt}`),
      url: sitePayload.url,
      businessName: sitePayload.businessName,
      vertical: sitePayload.vertical,
      ownerEmail: sitePayload.ownerEmail?.trim().toLowerCase(),
      createdAt,
      updatedAt: createdAt,
    };

    const sites = await this.updateSites((current) => {
      current.push(site);
      return current;
    });

    return sites[sites.length - 1] ?? site;
  }

  async listSites(): Promise<Site[]> {
    return this.readSites();
  }

  async getSiteById(siteId: string): Promise<Site | null> {
    const sites = await this.readSites();
    return sites.find((site) => site.id === siteId) ?? null;
  }

  async saveAudit(auditInput: AuditResult): Promise<AuditResult> {
    const audit = AuditResultSchema.parse(auditInput);
    const audits = await this.updateAudits((current) => {
      current.push(audit);
      return current;
    });

    return audits[audits.length - 1] ?? audit;
  }

  async getLatestAudit(siteId: string): Promise<AuditResult | null> {
    const audits = await this.readAudits();
    const [latest] = audits
      .filter((audit) => audit.siteId === siteId)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

    return latest ?? null;
  }

  async saveCrawlArtifacts(input: {
    crawl: CrawlResult;
    documents: Document[];
    chunks: Chunk[];
  }): Promise<void> {
    const crawl = CrawlResultSchema.parse(input.crawl);
    const documents = DocumentSchema.array().parse(input.documents);
    const chunks = ChunkSchema.array().parse(input.chunks);

    await this.updateCrawlResults((current) => {
      current.push(crawl);
      return current;
    });

    await this.updateDocuments((current) => [...current, ...documents]);
    await this.updateChunks((current) => [...current, ...chunks]);
  }

  async saveActionPlan(planInput: ActionPlan): Promise<ActionPlan> {
    const plan = ActionPlanSchema.parse(planInput);
    const plans = await this.updateActionPlans((current) => {
      current.push(plan);
      return current;
    });
    return plans[plans.length - 1] ?? plan;
  }

  async getLatestActionPlan(siteId: string): Promise<ActionPlan | null> {
    const plans = await this.readActionPlans();
    const [latest] = plans
      .filter((plan) => plan.siteId === siteId)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    return latest ?? null;
  }

  async saveRunHistory(entryInput: RunHistoryEntry): Promise<RunHistoryEntry> {
    const entry = RunHistoryEntrySchema.parse(entryInput);
    const history = await this.updateRunHistory((current) => [...current, entry]);
    return history[history.length - 1] ?? entry;
  }

  async listSiteHistory(siteId: string): Promise<RunHistoryEntry[]> {
    const history = await this.readRunHistory();
    return history
      .filter((entry) => entry.siteId === siteId)
      .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
  }

  async saveAlerts(alertInputs: AlertRecord[]): Promise<AlertRecord[]> {
    const alerts = AlertRecordSchema.array().parse(alertInputs);
    if (alerts.length === 0) {
      return [];
    }
    await this.updateAlerts((current) => [...current, ...alerts]);
    return alerts;
  }

  async listAlerts(siteId?: string): Promise<AlertRecord[]> {
    const alerts = await this.readAlerts();
    const filtered = siteId ? alerts.filter((alert) => alert.siteId === siteId) : alerts;
    return filtered.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }

  async listDocumentsBySiteId(siteId: string): Promise<Document[]> {
    const documents = await this.withFileLock(this.files.documents, async () => {
      const parsed = await this.readArrayFile(this.files.documents);
      return DocumentSchema.array().parse(parsed);
    });
    return documents.filter((document) => document.siteId === siteId);
  }

  async getBillingCustomerByEmail(email: string): Promise<BillingCustomer | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const customers = await this.readBillingCustomers();
    return customers.find((customer) => customer.email === normalizedEmail) ?? null;
  }

  async upsertBillingCustomer(customerInput: BillingCustomer): Promise<BillingCustomer> {
    const customer = BillingCustomerSchema.parse({
      ...customerInput,
      email: customerInput.email.trim().toLowerCase(),
    });
    const updated = await this.updateBillingCustomers((current) => {
      const index = current.findIndex((row) => row.email === customer.email);
      if (index === -1) {
        return [...current, customer];
      }
      const merged: BillingCustomer = {
        ...current[index],
        ...customer,
      };
      const next = [...current];
      next[index] = BillingCustomerSchema.parse(merged);
      return next;
    });
    return updated.find((row) => row.email === customer.email) ?? customer;
  }

  async listActiveSubscribedSites(limit: number): Promise<Site[]> {
    const [sites, customers] = await Promise.all([this.readSites(), this.readBillingCustomers()]);
    const activeEmails = new Set(
      customers
        .filter((row) => row.status === "active" || row.status === "trialing")
        .map((row) => row.email),
    );
    const subscribedSites = sites.filter(
      (site) => site.ownerEmail && activeEmails.has(site.ownerEmail),
    );
    return subscribedSites.slice(0, Math.max(0, limit));
  }

  private mutexFor(filePath: string): InProcessMutex {
    if (!this.mutexes.has(filePath)) {
      this.mutexes.set(filePath, new InProcessMutex());
    }
    return this.mutexes.get(filePath) as InProcessMutex;
  }

  private async readSites(): Promise<Site[]> {
    return this.withFileLock(this.files.sites, async () => {
      const parsed = await this.readArrayFile(this.files.sites);
      return SiteSchema.array().parse(parsed);
    });
  }

  private async readAudits(): Promise<AuditResult[]> {
    return this.withFileLock(this.files.audits, async () => {
      const parsed = await this.readArrayFile(this.files.audits);
      return AuditResultSchema.array().parse(parsed);
    });
  }

  private async updateSites(mutator: (current: Site[]) => Site[]): Promise<Site[]> {
    return this.withFileLock(this.files.sites, async () => {
      const current = SiteSchema.array().parse(await this.readArrayFile(this.files.sites));
      const updated = SiteSchema.array().parse(mutator([...current]));
      await this.writeArrayFile(this.files.sites, updated);
      return updated;
    });
  }

  private async updateAudits(
    mutator: (current: AuditResult[]) => AuditResult[],
  ): Promise<AuditResult[]> {
    return this.withFileLock(this.files.audits, async () => {
      const current = AuditResultSchema.array().parse(
        await this.readArrayFile(this.files.audits),
      );
      const updated = AuditResultSchema.array().parse(mutator([...current]));
      await this.writeArrayFile(this.files.audits, updated);
      return updated;
    });
  }

  private async updateCrawlResults(
    mutator: (current: CrawlResult[]) => CrawlResult[],
  ): Promise<CrawlResult[]> {
    return this.withFileLock(this.files.crawlResults, async () => {
      const current = CrawlResultSchema.array().parse(
        await this.readArrayFile(this.files.crawlResults),
      );
      const updated = CrawlResultSchema.array().parse(mutator([...current]));
      await this.writeArrayFile(this.files.crawlResults, updated);
      return updated;
    });
  }

  private async updateDocuments(
    mutator: (current: Document[]) => Document[],
  ): Promise<Document[]> {
    return this.withFileLock(this.files.documents, async () => {
      const current = DocumentSchema.array().parse(
        await this.readArrayFile(this.files.documents),
      );
      const updated = DocumentSchema.array().parse(mutator([...current]));
      await this.writeArrayFile(this.files.documents, updated);
      return updated;
    });
  }

  private async updateChunks(mutator: (current: Chunk[]) => Chunk[]): Promise<Chunk[]> {
    return this.withFileLock(this.files.chunks, async () => {
      const current = ChunkSchema.array().parse(await this.readArrayFile(this.files.chunks));
      const updated = ChunkSchema.array().parse(mutator([...current]));
      await this.writeArrayFile(this.files.chunks, updated);
      return updated;
    });
  }

  private async readBillingCustomers(): Promise<BillingCustomer[]> {
    return this.withFileLock(this.files.billingCustomers, async () => {
      const parsed = await this.readArrayFile(this.files.billingCustomers);
      return BillingCustomerSchema.array().parse(parsed);
    });
  }

  private async updateBillingCustomers(
    mutator: (current: BillingCustomer[]) => BillingCustomer[],
  ): Promise<BillingCustomer[]> {
    return this.withFileLock(this.files.billingCustomers, async () => {
      const current = BillingCustomerSchema.array().parse(
        await this.readArrayFile(this.files.billingCustomers),
      );
      const updated = BillingCustomerSchema.array().parse(mutator([...current]));
      await this.writeArrayFile(this.files.billingCustomers, updated);
      return updated;
    });
  }

  private async readRunHistory(): Promise<RunHistoryEntry[]> {
    return this.withFileLock(this.files.runHistory, async () => {
      const parsed = await this.readArrayFile(this.files.runHistory);
      return RunHistoryEntrySchema.array().parse(parsed);
    });
  }

  private async updateRunHistory(
    mutator: (current: RunHistoryEntry[]) => RunHistoryEntry[],
  ): Promise<RunHistoryEntry[]> {
    return this.withFileLock(this.files.runHistory, async () => {
      const current = RunHistoryEntrySchema.array().parse(
        await this.readArrayFile(this.files.runHistory),
      );
      const updated = RunHistoryEntrySchema.array().parse(mutator([...current]));
      await this.writeArrayFile(this.files.runHistory, updated);
      return updated;
    });
  }

  private async readAlerts(): Promise<AlertRecord[]> {
    return this.withFileLock(this.files.alerts, async () => {
      const parsed = await this.readArrayFile(this.files.alerts);
      return AlertRecordSchema.array().parse(parsed);
    });
  }

  private async updateAlerts(
    mutator: (current: AlertRecord[]) => AlertRecord[],
  ): Promise<AlertRecord[]> {
    return this.withFileLock(this.files.alerts, async () => {
      const current = AlertRecordSchema.array().parse(await this.readArrayFile(this.files.alerts));
      const updated = AlertRecordSchema.array().parse(mutator([...current]));
      await this.writeArrayFile(this.files.alerts, updated);
      return updated;
    });
  }

  private async readActionPlans(): Promise<ActionPlan[]> {
    return this.withFileLock(this.files.actionPlans, async () => {
      const parsed = await this.readArrayFile(this.files.actionPlans);
      return ActionPlanSchema.array().parse(parsed);
    });
  }

  private async updateActionPlans(
    mutator: (current: ActionPlan[]) => ActionPlan[],
  ): Promise<ActionPlan[]> {
    return this.withFileLock(this.files.actionPlans, async () => {
      const current = ActionPlanSchema.array().parse(
        await this.readArrayFile(this.files.actionPlans),
      );
      const updated = ActionPlanSchema.array().parse(mutator([...current]));
      await this.writeArrayFile(this.files.actionPlans, updated);
      return updated;
    });
  }

  private async withFileLock<T>(filePath: string, task: () => Promise<T>): Promise<T> {
    return this.mutexFor(filePath).runExclusive(task);
  }

  private async readArrayFile(filePath: string): Promise<unknown[]> {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      throw new Error(`Expected array in ${filePath}`);
    }
    return parsed;
  }

  private async writeArrayFile(filePath: string, data: unknown[]): Promise<void> {
    await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
  }
}

export const createFileStore = (options: FileStoreOptions = {}): AeoStore =>
  new FileStore(options);
