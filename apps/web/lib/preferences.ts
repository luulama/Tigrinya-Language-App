"use client";
import { create } from "zustand";
type Presentation = "child" | "teen" | "adult";
interface Preferences {
  presentation: Presentation;
  minutes: number;
  saving: boolean;
  storageError: string | null;
  set: (value: Partial<Pick<Preferences, "presentation" | "minutes">>) => void;
  save: (enabled: boolean) => void;
  restore: () => void;
}
const key = "polyglot.preferences.v1";
function write(value: { presentation: Presentation; minutes: number }) {
  window.localStorage.setItem(key, JSON.stringify(value));
}
export const usePreferences = create<Preferences>((set, get) => ({
  presentation: "child",
  minutes: 5,
  saving: false,
  storageError: null,
  set(value) {
    const next = { ...get(), ...value };
    if (next.saving) {
      try {
        write({ presentation: next.presentation, minutes: next.minutes });
        next.storageError = null;
      } catch {
        next.saving = false;
        next.storageError =
          "Your latest choices could not be saved. They only apply to this visit.";
      }
    }
    set(next);
  },
  save(enabled) {
    if (enabled) {
      const { presentation, minutes } = get();
      write({ presentation, minutes });
      set({ saving: true, storageError: null });
    } else {
      window.localStorage.removeItem(key);
      set({ saving: false, storageError: null });
    }
  },
  restore() {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return;
      const value = JSON.parse(raw);
      if (
        ["child", "teen", "adult"].includes(value.presentation) &&
        [3, 5, 10, 15, 30].includes(value.minutes)
      )
        set({
          presentation: value.presentation,
          minutes: value.minutes,
          saving: true,
        });
    } catch {
      set({ saving: false });
    }
  },
}));
