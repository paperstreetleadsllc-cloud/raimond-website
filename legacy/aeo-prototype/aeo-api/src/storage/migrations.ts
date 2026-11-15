import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  AlertRecordSchema,
  ActionPlanSchema,
  AuditResultSchema,
  BillingCustomerSchema,
  ChunkSchema,
  CrawlResultSchema,
  DocumentSchema,
  RunHistoryEntrySchema,
  SiteSchema,
  type AlertRecord,
  type ActionPlan,
  type AuditResult,
  type BillingCustomer,
  type Chunk,
  type CrawlResult,
  type Document,
  type RunHistoryEntry,
  type Site,
} from "../domain/types.js";

const storageRoot = path.dirname(fileURLToPath(import.meta.url));
export const defaultDataDir = path.resolve(storageRoot, "../../data");

const files = {
  sites: "sites.json",
  audits: "audits.json",
  crawlResults: "crawl-results.json",
  documents: "documents.json",
  chunks: "chunks.json",
  billingCustomers: "billing-customers.json",
  runHistory: "run-history.json",
  alerts: "alerts.json",
  actionPlans: "action-plans.json",
};

const hashInput = (value: string): string =>
  createHash("sha256").update(value).digest("hex").slice(0, 16);

const makeId = (prefix: string, seed: string): string => `${prefix}_${hashInput(seed)}`;

const sampleTimestamp = "2026-01-01T00:00:00.000Z";
const sampleSiteUrl = "https://example.com";

const sampleSite: Site = {
  id: makeId("site", `${sampleSiteUrl}|${sampleTimestamp}`),
  url: sampleSiteUrl,
  businessName: "Sample Site",
  vertical: "insurance",
  createdAt: sampleTimestamp,
  updatedAt: sampleTimestamp,
};

const sampleAudit: AuditResult = {
  id: makeId("audit", `${sampleSite.id}|${sampleTimestamp}`),
  siteId: sampleSite.id,
  score: 72,
  totalScore: 72,
  status: "completed",
  findings: [
    "Add more explicit product schema markup.",
    "Increase answer-targeted FAQ depth for key intents.",
  ],
  topWinningQueries: ["life insurance quote", "term life insurance guide"],
  weakAreas: ["comparison", "trust-legitimacy"],
  competitorGap: "Competitor benchmark pending",
  recommendedActions: [
    "Publish trust and licensing proofs.",
    "Expand comparison-focused service pages.",
  ],
  createdAt: sampleTimestamp,
};

const readArrayFile = async <T>(filePath: string): Promise<T[]> => {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed as T[];
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
};

const writeArrayFile = async <T>(filePath: string, data: T[]): Promise<void> => {
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
};

export const ensureDataMigrations = async (
  dataDir: string = defaultDataDir,
): Promise<void> => {
  await mkdir(dataDir, { recursive: true });

  const sitesPath = path.join(dataDir, files.sites);
  const auditsPath = path.join(dataDir, files.audits);
  const crawlResultsPath = path.join(dataDir, files.crawlResults);
  const documentsPath = path.join(dataDir, files.documents);
  const chunksPath = path.join(dataDir, files.chunks);
  const billingCustomersPath = path.join(dataDir, files.billingCustomers);
  const runHistoryPath = path.join(dataDir, files.runHistory);
  const alertsPath = path.join(dataDir, files.alerts);
  const actionPlansPath = path.join(dataDir, files.actionPlans);

  const currentSites = await readArrayFile<Site>(sitesPath);
  const currentAudits = await readArrayFile<AuditResult>(auditsPath);
  const currentCrawls = await readArrayFile<CrawlResult>(crawlResultsPath);
  const currentDocuments = await readArrayFile<Document>(documentsPath);
  const currentChunks = await readArrayFile<Chunk>(chunksPath);
  const currentBillingCustomers = await readArrayFile<BillingCustomer>(billingCustomersPath);
  const currentRunHistory = await readArrayFile<RunHistoryEntry>(runHistoryPath);
  const currentAlerts = await readArrayFile<AlertRecord>(alertsPath);
  const currentActionPlans = await readArrayFile<ActionPlan>(actionPlansPath);

  const validSites = SiteSchema.array().safeParse(currentSites).success
    ? currentSites
    : [];
  const validAudits = AuditResultSchema.array().safeParse(currentAudits).success
    ? currentAudits
    : [];
  const validCrawls = CrawlResultSchema.array().safeParse(currentCrawls).success
    ? currentCrawls
    : [];
  const validDocuments = DocumentSchema.array().safeParse(currentDocuments).success
    ? currentDocuments
    : [];
  const validChunks = ChunkSchema.array().safeParse(currentChunks).success
    ? currentChunks
    : [];
  const validBillingCustomers = BillingCustomerSchema.array().safeParse(
    currentBillingCustomers,
  ).success
    ? currentBillingCustomers
    : [];
  const validRunHistory = RunHistoryEntrySchema.array().safeParse(currentRunHistory).success
    ? currentRunHistory
    : [];
  const validAlerts = AlertRecordSchema.array().safeParse(currentAlerts).success
    ? currentAlerts
    : [];
  const validActionPlans = ActionPlanSchema.array().safeParse(currentActionPlans).success
    ? currentActionPlans
    : [];

  if (validSites.length === 0) {
    validSites.push(sampleSite);
  }

  if (validAudits.length === 0) {
    validAudits.push(sampleAudit);
  }

  await writeArrayFile(sitesPath, validSites);
  await writeArrayFile(auditsPath, validAudits);
  await writeArrayFile(crawlResultsPath, validCrawls);
  await writeArrayFile(documentsPath, validDocuments);
  await writeArrayFile(chunksPath, validChunks);
  await writeArrayFile(billingCustomersPath, validBillingCustomers);
  await writeArrayFile(runHistoryPath, validRunHistory);
  await writeArrayFile(alertsPath, validAlerts);
  await writeArrayFile(actionPlansPath, validActionPlans);
};
