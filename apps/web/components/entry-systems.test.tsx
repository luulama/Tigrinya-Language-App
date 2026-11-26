import "@testing-library/jest-dom/vitest";
import { StrictMode } from "react";
import { afterEach, beforeEach, it, expect, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FirstLesson } from "./first-lesson";
import { LearningJourneyProvider } from "./learning-journey";
import { StartingPlanPage } from "./starting-plan";
import { ParentExperience } from "./parent-experience";
import { request } from "../lib/api";
vi.mock("../lib/api", () => ({
  request: vi.fn(),
  apiBase: "http://localhost",
}));
beforeEach(() =>
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {}),
);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.mocked(request).mockReset();
});
const content = {
  target: "በ",
  options: ["በ", "ቡ", "ቢ"],
  revision: "synthetic-source-version",
  audioUrl: null,
  pendingReview: true,
};
function show(children: React.ReactNode, strict = false) {
  const tree = (
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <LearningJourneyProvider>{children}</LearningJourneyProvider>
    </QueryClientProvider>
  );
  return render(strict ? <StrictMode>{tree}</StrictMode> : tree);
}
function complete() {
  const lesson = within(
    screen.getByRole("region", { name: "First Fidäl practice" }),
  );
  fireEvent.click(lesson.getByRole("button", { name: "Try the shape" }));
  fireEvent.click(
    lesson.getByRole("button", { name: "Choose a shape instead of drawing" }),
  );
  fireEvent.click(lesson.getByRole("button", { name: "Next" }));
  fireEvent.click(lesson.getByRole("button", { name: "በ" }));
  fireEvent.click(lesson.getByRole("button", { name: "Next" }));
  fireEvent.click(lesson.getByRole("button", { name: "ቡ" }));
  fireEvent.click(lesson.getByRole("button", { name: "Try again" }));
  fireEvent.click(lesson.getByRole("button", { name: "በ" }));
  fireEvent.click(lesson.getByRole("button", { name: "See my practice" }));
}

it.each([
  [
    "onboarding",
    <StartingPlanPage />,
    "Skip this question",
    "When you speak Tigrinya…",
  ],
  [
    "first practice",
    <FirstLesson content={content} />,
    "Try the shape",
    "Try its shape",
  ],
])(
  "%s preserves initial focus during Strict Mode hydration and focuses real step changes",
  (_name, component, action, nextHeading) => {
    const existingControl = document.createElement("button");
    existingControl.textContent = "Existing navigation control";
    document.body.append(existingControl);
    existingControl.focus();
    try {
      show(component, true);
      expect(existingControl).toHaveFocus();
      fireEvent.click(
        screen.getByRole("button", { name: action as string }),
      );
      expect(
        screen.getByRole("heading", {
          name: nextHeading as string,
        }),
      ).toHaveFocus();
    } finally {
      existingControl.remove();
    }
  },
);
it("finishes a supported visual practice and a truthful parent recap without an account", async () => {
  show(
    <>
      <FirstLesson content={content} />
      <ParentExperience />
    </>,
  );
  complete();
  expect(
    screen.getByRole("heading", { name: "Your first practice" }),
  ).toBeVisible();
  expect(screen.getByText("Sound wasn’t practised.")).toBeVisible();
  expect(
    await screen.findByText(/Was shown በ and found its match/),
  ).toBeVisible();
  expect(screen.getByText(/final shape check used help/)).toBeVisible();
  expect(request).not.toHaveBeenCalled();
});
it("pauses and resumes the exact step with no claim of completion", () => {
  show(<FirstLesson content={content} />);
  fireEvent.click(screen.getByRole("button", { name: "Try the shape" }));
  fireEvent.click(screen.getByRole("button", { name: "Pause" }));
  expect(
    screen.getByRole("heading", { name: "We can pause here." }),
  ).toHaveFocus();
  fireEvent.click(
    screen.getByRole("button", { name: "Continue this practice" }),
  );
  expect(screen.getByRole("heading", { name: "Try its shape" })).toBeVisible();
});
it("recognises an actual audio playing event rather than a play-button tap", () => {
  const { container } = show(
    <FirstLesson content={{ ...content, audioUrl: "/test-only.wav" }} />,
  );
  fireEvent.playing(container.querySelector("audio")!);
  complete();
  expect(screen.getByText("The reviewed model played.")).toBeVisible();
});
it("recovers from media failure without claiming sound practice", () => {
  const { container } = show(
    <FirstLesson content={{ ...content, audioUrl: "/test-only.wav" }} />,
  );
  fireEvent.error(container.querySelector("audio")!);
  expect(screen.getByText(/Sound couldn’t play/)).toBeVisible();
  complete();
  expect(screen.getByText("Sound wasn’t practised.")).toBeVisible();
});
it("keeps newer visit choices when a delayed account load finishes", async () => {
  let resolve!: (value: unknown) => void;
  vi.mocked(request).mockReturnValueOnce(
    new Promise((done) => {
      resolve = done;
    }),
  );
  show(<StartingPlanPage />);
  fireEvent.click(screen.getByText("What Mele remembers"));
  fireEvent.click(screen.getByRole("button", { name: "Load saved plan" }));
  fireEvent.click(
    screen.getByRole("button", { name: "I understand comfortably" }),
  );
  resolve({
    listening: "new",
    speaking: "new",
    reading: "new",
    goal: "reading",
    pace: "step",
    quiet: false,
    revision: "synthetic-version",
  });
  expect(
    await screen.findByText(/newer choices in this visit were kept/),
  ).toBeVisible();
  expect(
    screen.getByRole("button", { name: "I understand comfortably" }),
  ).toHaveAttribute("aria-pressed", "true");
});
it("offers keyboard writing and records its actual modality", () => {
  show(<FirstLesson content={content} />);
  fireEvent.click(screen.getByRole("button", { name: "Try the shape" }));
  fireEvent.click(screen.getByRole("button", { name: "Use keys instead" }));
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "በ" } });
  fireEvent.click(screen.getByRole("button", { name: "Compare text" }));
  expect(screen.getByText(/checks text, not handwriting/)).toBeVisible();
  expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
});
it("onboards an oral listener without making an ability claim or saving automatically", () => {
  show(<StartingPlanPage />);
  fireEvent.click(
    screen.getByRole("button", { name: "I understand comfortably" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  fireEvent.click(screen.getByRole("button", { name: "I haven’t started" }));
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  fireEvent.click(screen.getByRole("button", { name: "The forms are new" }));
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  fireEvent.click(screen.getByRole("button", { name: "See my plan" }));
  expect(
    screen.getByText(/Build on what you already understand/),
  ).toBeVisible();
  expect(screen.getByText(/No level has been assigned/)).toBeVisible();
  expect(request).not.toHaveBeenCalled();
});
it("keeps memory failure recoverable and makes saving explicitly optional", async () => {
  vi.mocked(request).mockRejectedValueOnce(
    new Error("Sign-in is unavailable."),
  );
  show(<StartingPlanPage />);
  fireEvent.click(screen.getByText("What Mele remembers"));
  fireEvent.click(
    screen.getByRole("button", { name: "Save plan to my account" }),
  );
  expect(await screen.findByText("Sign-in is unavailable.")).toBeVisible();
  expect(
    screen.getByRole("link", { name: "Start without questions" }),
  ).toHaveAttribute("href", "/first-lesson");
});
it("does not show a fictitious parent dashboard or query accounts until requested", async () => {
  show(<ParentExperience />);
  expect(screen.getByText(/No first practice recorded/)).toBeVisible();
  expect(request).not.toHaveBeenCalled();
  vi.mocked(request).mockResolvedValueOnce([]);
  fireEvent.click(
    screen.getByRole("button", { name: "Linked account · last 7 days" }),
  );
  expect(await screen.findByText("No linked learners yet")).toBeVisible();
  await waitFor(() =>
    expect(request).toHaveBeenCalledWith(
      "/api/parents/learners",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
      true,
    ),
  );
});
