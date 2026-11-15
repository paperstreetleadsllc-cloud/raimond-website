export type AeoSite = {
  id: string;
  url: string;
  businessName?: string;
  vertical?: string;
  ownerEmail?: string;
  createdAt: string;
  updatedAt: string;
};

export type AeoAudit = {
  id: string;
  siteId: string;
  score: number;
  totalScore: number;
  status: "completed" | "failed";
  findings: string[];
  topWinningQueries: string[];
  weakAreas: string[];
  competitorGap: string;
  recommendedActions: string[];
  createdAt: string;
};

export type BillingPlan = "starter" | "pro" | "agency";

export type AeoPlanDeliverable =
  | {
      type: "jsonld";
      label: string;
      json: Record<string, unknown>;
    }
  | {
      type: "copy";
      label: string;
      text: string;
    }
  | {
      type: "outline";
      label: string;
      sections: string[];
    };

export type AeoPlanItem = {
  id: string;
  title: string;
  priority: "P0" | "P1" | "P2";
  category: string;
  estimatedImpact: string;
  effort: string;
  instructions: string[];
  deliverables: AeoPlanDeliverable[];
};

export type AeoActionPlan = {
  id: string;
  siteId: string;
  createdAt: string;
  summary: string;
  items: AeoPlanItem[];
};

type ApiResponse<T> = {
  data: T;
};

const baseUrl =
  (import.meta.env.VITE_AEO_API as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:4000";

const parseErrorMessage = async (response: Response): Promise<string> => {
  try {
    const parsed = (await response.json()) as { error?: string; message?: string };
    return parsed.error ?? parsed.message ?? `Request failed with ${response.status}`;
  } catch {
    return `Request failed with ${response.status}`;
  }
};

export class ApiError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

const request = async <T>(path: string, init?: globalThis.RequestInit): Promise<T> => {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response), response.status);
  }

  return (await response.json()) as T;
};

const requestWithFallback = async <T>(
  primaryPath: string,
  fallbackPath: string | null,
  init?: globalThis.RequestInit,
): Promise<T> => {
  try {
    return await request<T>(primaryPath, init);
  } catch (error) {
    if (
      fallbackPath &&
      error instanceof ApiError &&
      (error.statusCode === 404 || error.statusCode === 405)
    ) {
      return request<T>(fallbackPath, init);
    }
    throw error;
  }
};

export const aeoApi = {
  listSites: async (): Promise<AeoSite[]> => {
    const response = await request<ApiResponse<AeoSite[]>>("/sites");
    return response.data;
  },

  createSite: async (input: {
    url: string;
    businessName?: string;
    vertical?: string;
    ownerEmail?: string;
  }): Promise<AeoSite> => {
    const response = await request<ApiResponse<AeoSite>>("/sites", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return response.data;
  },

  runAudit: async (siteId: string): Promise<AeoAudit> => {
    const response = await request<ApiResponse<AeoAudit>>("/audits/run", {
      method: "POST",
      body: JSON.stringify({ siteId }),
    });
    return response.data;
  },

  getLatestAudit: async (siteId: string): Promise<AeoAudit | null> => {
    try {
      const response = await request<ApiResponse<AeoAudit>>(`/audits/${siteId}`);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  },

  generatePlan: async (siteId: string): Promise<AeoActionPlan> => {
    const response = await request<ApiResponse<AeoActionPlan>>("/v1/plans/generate", {
      method: "POST",
      body: JSON.stringify({ siteId }),
    });
    return response.data;
  },

  getLatestPlan: async (siteId: string): Promise<AeoActionPlan | null> => {
    try {
      const response = await request<ApiResponse<AeoActionPlan>>(`/v1/plans/${siteId}`);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  },

  createCheckoutSession: async (input: {
    email: string;
    plan: BillingPlan;
  }): Promise<{ checkoutUrl: string; sessionId: string }> => {
    const response = await requestWithFallback<
      ApiResponse<{ checkoutUrl: string; sessionId: string }>
    >("/billing/create-checkout-session", "/v1/billing/create-checkout-session", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return response.data;
  },

  createCustomerPortal: async (email: string): Promise<{ portalUrl: string }> => {
    const query = new URLSearchParams({ email }).toString();
    const response = await requestWithFallback<ApiResponse<{ portalUrl: string }>>(
      `/billing/customer-portal?${query}`,
      `/v1/billing/customer-portal?${query}`,
    );
    return response.data;
  },
};

export const isSubscriptionRequiredError = (error: unknown): boolean =>
  error instanceof ApiError &&
  error.statusCode === 402 &&
  error.message.toUpperCase() === "SUBSCRIPTION_REQUIRED";
