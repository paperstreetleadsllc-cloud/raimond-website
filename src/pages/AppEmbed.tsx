function getProcessEnv(): Record<string, string | undefined> | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env = (globalThis as any).process?.env;
  return env as Record<string, string | undefined> | undefined;
}

function isTestRuntime(): boolean {
  return import.meta.env.MODE === "test" || getProcessEnv()?.VITEST === "true";
}

export function getHudOrigin(): string | undefined {
  const hudOriginFromVite = import.meta.env.VITE_HUD_ORIGIN;
  if (typeof hudOriginFromVite === "string" && hudOriginFromVite.trim().length > 0) {
    return hudOriginFromVite;
  }

  if (isTestRuntime()) {
    const hudOriginFromProcess = getProcessEnv()?.VITE_HUD_ORIGIN;
    if (typeof hudOriginFromProcess === "string" && hudOriginFromProcess.trim().length > 0) {
      return hudOriginFromProcess;
    }
  }

  return undefined;
}

export default function AppEmbed() {
  return null;
}
