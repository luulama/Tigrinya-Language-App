import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Shell } from "./shell";
import { usePreferences } from "../lib/preferences";

vi.mock("next/navigation", () => ({ usePathname: () => "/learn" }));
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
  usePreferences.setState(usePreferences.getInitialState());
});

it("announces a failed preference update after saving was already enabled", () => {
  usePreferences.getState().save(true);
  const saved = localStorage.getItem("polyglot.preferences.v1");
  render(<Shell><p>Test-only content</p></Shell>);
  fireEvent.click(screen.getByRole("button", { name: "Settings" }));
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new DOMException("Storage unavailable", "QuotaExceededError");
  });
  fireEvent.change(screen.getByLabelText("Time available"), { target: { value: "3" } });
  expect(screen.getByLabelText("Time available")).toHaveValue("3");
  expect(screen.getByRole("status")).toHaveTextContent(/could not be saved|Saving is unavailable/i);
  expect(screen.getByRole("button", { name: "Save preferences on this device" })).toBeEnabled();
  expect(localStorage.getItem("polyglot.preferences.v1")).toBe(saved);
});
