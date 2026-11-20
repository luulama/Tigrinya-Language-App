import "@testing-library/jest-dom/vitest";
import { it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ContentReader, QuestionActivity } from "./learning";
import { ApiError, request } from "../lib/api";
import type { ContentItem, Question } from "@polyglot/shared-types";
vi.mock("../lib/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../lib/api")>()),
  apiBase: "http://localhost",
  request: vi.fn(),
}));
afterEach(() => {
  cleanup();
  vi.mocked(request).mockReset();
});
const fixture: Question = {
  id: "question-fixture",
  revision: 1,
  targetId: "target-fixture",
  prompt: "Test-only question",
  options: ["alpha", "beta"],
  skill: "Reading",
};

it("renders answer controls when a published question is opened directly", async () => {
  const item: ContentItem = {
    id: fixture.id,
    revision: 1,
    languageTag: "en",
    kind: "Question",
    title: "Question fixture",
    state: "Published",
    concurrencyStamp: "fixture-stamp",
    payload: { ...fixture },
  };
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(["content", item.id], item);
  render(
    <QueryClientProvider client={client}>
      <ContentReader id={item.id} />
    </QueryClientProvider>,
  );
  expect(await screen.findByRole("button", { name: "alpha" })).toBeEnabled();
  expect(screen.getByRole("button", { name: "Check" })).toBeDisabled();
});

it("offers reload instead of resubmitting an obsolete question after a revision conflict", async () => {
  vi.mocked(request).mockRejectedValueOnce(new ApiError(409, "New question version"));
  render(
    <QueryClientProvider client={new QueryClient()}>
      <QuestionActivity question={fixture} />
    </QueryClientProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "alpha" }));
  fireEvent.click(screen.getByRole("button", { name: "Check" }));
  expect(await screen.findByRole("button", { name: "Reload question" })).toBeEnabled();
  expect(screen.queryByRole("link", { name: "Sign in" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Check" })).not.toBeInTheDocument();
});

it("retries an uncertain network submission with the exact original event and answer", async () => {
  vi.mocked(request)
    .mockRejectedValueOnce(new ApiError(503, "Service unavailable"))
    .mockResolvedValueOnce({ correct: true, helped: false, replayed: true });
  render(
    <QueryClientProvider client={new QueryClient()}>
      <QuestionActivity question={fixture} />
    </QueryClientProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "alpha" }));
  fireEvent.click(screen.getByRole("button", { name: "Check" }));
  await screen.findByText(/Service unavailable/);
  expect(screen.getByRole("button", { name: "beta" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Check" }));
  await screen.findByText("Matched.");
  expect(vi.mocked(request).mock.calls[1][1]?.body).toBe(vi.mocked(request).mock.calls[0][1]?.body);
  expect(screen.queryByRole("link", { name: "Sign in" })).not.toBeInTheDocument();
});
it("requires an answer, gives a model after a mistake and records a supported retry", async () => {
  vi.mocked(request)
    .mockResolvedValueOnce({
      correct: false,
      helped: false,
      model: "ቤት",
      explanation: "Compare the model.",
      replayed: false,
    })
    .mockResolvedValueOnce({ correct: true, helped: true, replayed: false });
  render(
    <QueryClientProvider client={new QueryClient()}>
      <QuestionActivity
        question={{
          id: "question",
          revision: 1,
          targetId: "target",
          prompt: "Find the word",
          options: ["ቤት", "ማይ"],
          skill: "Reading",
        }}
      />
    </QueryClientProvider>,
  );
  expect(screen.getByRole("button", { name: "Check" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "ማይ" }));
  fireEvent.click(screen.getByRole("button", { name: "Check" }));
  await screen.findByText("Compare with the model:");
  fireEvent.click(screen.getByRole("button", { name: "Try with the model" }));
  fireEvent.click(screen.getByRole("button", { name: "ቤት" }));
  fireEvent.click(screen.getByRole("button", { name: "Check" }));
  await waitFor(() =>
    expect(screen.getByText(/You practised with help/)).toBeInTheDocument(),
  );
  const body = JSON.parse(
    (vi.mocked(request).mock.calls[1][1] as RequestInit).body as string,
  );
  expect(body.helped).toBe(true);
  expect(body).not.toHaveProperty("correct");
});
