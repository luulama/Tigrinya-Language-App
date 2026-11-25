import "@testing-library/jest-dom/vitest";
import { afterEach, it, expect } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { BearCompanion } from "./bear-companion";
afterEach(cleanup);
it("keeps quiet mode and readable feedback while the bear changes expression", () => {
  const { rerender, container } = render(
    <BearCompanion state="resting" caption="Take your time." />,
  );
  expect(screen.getByRole("img")).toHaveAttribute(
    "src",
    "/preview/shared/mascot/assets/neri-resting.svg",
  );
  fireEvent.click(screen.getByRole("button", { name: "Quiet view" }));
  rerender(<BearCompanion state="kind" caption="Have another look." />);
  expect(container.querySelector("figure")).toHaveAttribute(
    "data-quiet",
    "true",
  );
  expect(screen.getByText("Have another look.")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Show Mele" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  fireEvent.click(screen.getByRole("button", { name: "Show Mele" }));
  expect(container.querySelector("figure")).toHaveAttribute(
    "data-quiet",
    "false",
  );
});
it("a failed illustration leaves the caption and controls usable and recovers on a later loaded image", () => {
  render(<BearCompanion caption="One small step." />);
  const img = screen.getByRole("img");
  fireEvent.error(img);
  expect(img).not.toBeVisible();
  expect(screen.getByText("One small step.")).toBeVisible();
  fireEvent.load(img);
  expect(img).toBeVisible();
});
