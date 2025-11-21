import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AppEmbed from "../AppEmbed";

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe("AppEmbed", () => {
  it("renders the HUD iframe in development", () => {
    vi.stubEnv("VITE_HUD_ORIGIN", "http://localhost:5173/");
    render(<AppEmbed />);
    const frame = screen.getByTitle("RAimond App");
    expect(frame).toBeInTheDocument();
    expect(frame).toHaveAttribute("src", "http://localhost:5173/");
    expect(frame).toHaveClass("w-full", { exact: false });
  });
});

