import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MeleStage, useReducedMotion } from "./MeleStage";
import { createSnapshot, MELE_STATES, type MeleState } from "./motion";

const posters = Object.fromEntries(
  MELE_STATES.map((state) => [state, `/${state}.svg`]),
) as Record<MeleState, string>;
const base = createSnapshot({
  sessionId: "fixture",
  taskRevision: "fixture",
  nativeModelReady: false,
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("semantic and static fallback", () => {
  it("keeps result and next action usable during celebration", () => {
    const { rerender } = render(
      <>
        <MeleStage
          snapshot={{ ...base, pose: "celebrating" }}
          posters={posters}
          status="Practice complete."
        />
        <button>Continue</button>
      </>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Practice complete.");
    expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();
    rerender(
      <>
        <MeleStage
          snapshot={{ ...base, pose: "celebrating", quiet: true }}
          posters={posters}
          status="Practice complete."
        />
        <button>Continue</button>
      </>,
    );
    expect(screen.getByRole("status")).toBeVisible();
    expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();
  });
  it("keeps text usable when a poster fails", () => {
    const { container } = render(
      <MeleStage
        snapshot={base}
        posters={posters}
        status="Choose your next step."
      />,
    );
    fireEvent.error(container.querySelector("img")!);
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Choose your next step.",
    );
  });
  it("cancels an in-flight visual when the component unmounts", () => {
    const cancel = vi.fn();
    const original = HTMLElement.prototype.animate;
    HTMLElement.prototype.animate = vi.fn(
      () =>
        ({ finished: new Promise(() => {}), cancel }) as unknown as Animation,
    );
    try {
      const { unmount } = render(
        <MeleStage
          snapshot={{ ...base, pose: "celebrating", reduced: false }}
          posters={posters}
          status="Complete."
        />,
      );
      unmount();
      expect(cancel).toHaveBeenCalled();
    } finally {
      HTMLElement.prototype.animate = original;
    }
  });
});

describe("live reduced-motion policy", () => {
  function Probe({ still = false }: { still?: boolean }) {
    return <p>{useReducedMotion(still) ? "still" : "motion"}</p>;
  }
  it("uses a static fallback when media query support is absent", () => {
    vi.stubGlobal("matchMedia", undefined);
    render(<Probe />);
    expect(screen.getByText("still")).toBeVisible();
  });
  it("reacts to the OS and removes its listener", () => {
    let change = () => {};
    const media = {
      matches: false,
      addEventListener: vi.fn((_: string, fn: () => void) => {
        change = fn;
      }),
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal("matchMedia", () => media);
    const { unmount } = render(<Probe />);
    expect(screen.getByText("motion")).toBeVisible();
    act(() => {
      media.matches = true;
      change();
    });
    expect(screen.getByText("still")).toBeVisible();
    unmount();
    expect(media.removeEventListener).toHaveBeenCalledWith("change", change);
  });
  it("never overrides the OS with more motion", () => {
    vi.stubGlobal("matchMedia", () => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    render(<Probe still={false} />);
    expect(screen.getByText("still")).toBeVisible();
  });
});
