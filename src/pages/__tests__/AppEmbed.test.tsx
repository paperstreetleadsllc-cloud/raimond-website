import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AppEmbed, { getHudOrigin } from "../AppEmbed";

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe("AppEmbed", () => {
  it("renders nothing", () => {
    render(<AppEmbed />);
    expect(screen.queryByTitle("RAimond App")).not.toBeInTheDocument();
  });

  it("reads VITE_HUD_ORIGIN from vi.stubEnv in test runtime", () => {
    vi.stubEnv("VITE_HUD_ORIGIN", "https://hud.example.test/");
    expect(getHudOrigin()).toBe("https://hud.example.test/");
  });
});

