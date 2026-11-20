import { it, expect } from "vitest";
import { graphemes, searchKey, safeAssetPath } from "./index";
it("preserves Ethiopic marks and two-grapheme words", () => {
  expect(graphemes("ማይ")).toHaveLength(2);
  expect(graphemes("ሃየ፟")).toHaveLength(2);
  expect(searchKey(" ቤት ")).toBe("ቤት");
});
it("blocks traversal and remote asset paths", () => {
  expect(safeAssetPath("images/house.png")).toBe(true);
  expect(safeAssetPath("../secret")).toBe(false);
  expect(safeAssetPath("https://host/file")).toBe(false);
  expect(safeAssetPath("a\\..\\secret")).toBe(false);
});
