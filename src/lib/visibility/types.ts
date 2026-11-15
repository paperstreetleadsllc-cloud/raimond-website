import type { PromptIntent } from "../audit/types";

/**
 * One recorded answer from one AI search provider to one customer question.
 * This is the unit of evidence for Observed AI Visibility: nothing is reported
 * to a customer that cannot be traced back to rows like this.
 */
export interface RawObservation {
  provider: string;
  /** How the answer was collected, e.g. "official API with web search enabled". */
  method: string;
  model: string;
  question: string;
  intent: PromptIntent;
  observedAt: string;
  answerText: string;
  /** URLs the provider cited as sources, in the order returned. */
  citations: string[];
  /** Provider-reported cost for this call, when available. */
  costUsd: number | null;
}

export interface ObservationAnalysis {
  mentioned: boolean;
  /** See detect.ts for the exact, deliberately narrow definition. */
  recommended: boolean;
  cited: boolean;
  citedUrls: string[];
  /** Other businesses named as options in the answer. */
  namedCompetitors: string[];
  /** Cited domains that are neither the business nor a known directory. */
  citedCompetitorDomains: string[];
}

export interface ProviderAdapter {
  key: string;
  name: string;
  method: string;
  /** False when credentials are missing; the provider is then "Not currently measured". */
  isConfigured(): boolean;
  observe(question: string, intent: PromptIntent): Promise<RawObservation>;
}

export interface VisibilitySummary {
  provider: string;
  promptsTested: number;
  mentionRate: number | null;
  recommendationRate: number | null;
  citationRate: number | null;
  firstObservedAt: string | null;
  lastObservedAt: string | null;
}
