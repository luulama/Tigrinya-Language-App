import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export const cn = (...values: ClassValue[]) => twMerge(clsx(values));
export function graphemes(text: string): string[] {
  return [
    ...new Intl.Segmenter("ti", { granularity: "grapheme" }).segment(
      text.normalize("NFC"),
    ),
  ].map((part) => part.segment);
}
export function searchKey(text: string): string {
  return text.normalize("NFC").toLocaleLowerCase().trim();
}
export function safeAssetPath(path: string): boolean {
  return (
    !!path &&
    !path.startsWith("/") &&
    !path.includes(":") &&
    !path.split(/[\\/]/).includes("..")
  );
}
