"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, Dialog } from "@polyglot/ui";
import { usePreferences } from "../lib/preferences";
import { useState } from "react";
export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(),
    preferences = usePreferences();
  const [message, setMessage] = useState("");
  const navigation = [
    ["/learn", "Learn"],
    ["/games", "Games"],
    ["/review", "Review"],
    ["/stories", "Stories"],
    ["/progress", "Progress"],
  ];
  return (
    <div data-presentation={preferences.presentation}>
      <a className="skip" href="#main">
        Skip to learning
      </a>
      <header className="site-header">
        <Link className="brand" href="/">
          Tigrinya<span aria-hidden="true"> •</span>
        </Link>
        <nav aria-label="Main navigation">
          {navigation.map(([href, title]) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
            >
              {title}
            </Link>
          ))}
        </nav>
        <Dialog
          title="Your pace"
          description="Choose how the app looks. This does not change your learning level."
          trigger={<Button variant="outline">Settings</Button>}
        >
          <label>
            Presentation
            <select
              value={preferences.presentation}
              onChange={(e) =>
                preferences.set({
                  presentation: e.target.value as "child" | "teen" | "adult",
                })
              }
            >
              <option value="child">Pictures first</option>
              <option value="teen">Teen</option>
              <option value="adult">Adult</option>
            </select>
          </label>
          <label>
            Time available
            <select
              value={preferences.minutes}
              onChange={(e) =>
                preferences.set({ minutes: Number(e.target.value) })
              }
            >
              {[3, 5, 10, 15, 30].map((n) => (
                <option key={n} value={n}>
                  {n} minutes
                </option>
              ))}
            </select>
          </label>
          <p>No timer. Stop whenever you need.</p>
          <Button
            variant="outline"
            onClick={() => {
              try {
                preferences.save(!preferences.saving);
                setMessage(
                  preferences.saving
                    ? "Device preferences removed. This visit keeps your choices."
                    : "Preferences saved on this device.",
                );
              } catch {
                setMessage(
                  "Saving is unavailable. Your choices still work for this visit.",
                );
              }
            }}
          >
            {preferences.saving
              ? "Stop saving preferences"
              : "Save preferences on this device"}
          </Button>
          <p role="status">{preferences.storageError ?? message}</p>
        </Dialog>
      </header>
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <footer>
        <p>Go at your own pace.</p>
        <nav aria-label="Account and teaching tools">
          <Link href="/profile">Profile</Link>
          <Link href="/conversations">Conversations</Link>
          <Link href="/achievements">Achievements</Link>
          <Link href="/parents">Parents</Link>
          <Link href="/teachers">Teachers</Link>
          <Link href="/reviewer">Reviewers</Link>
          <Link href="/admin">Content tools</Link>
          <Link href="/signin">Sign in</Link>
        </nav>
      </footer>
    </div>
  );
}
