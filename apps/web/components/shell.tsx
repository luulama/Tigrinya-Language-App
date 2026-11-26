"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, Dialog } from "@polyglot/ui";
import { usePreferences } from "../lib/preferences";
import { useState } from "react";
import {
  BookOpenIcon,
  ChartIcon,
  CompassIcon,
  RefreshIcon,
  SlidersIcon,
  SparklesIcon,
} from "./icons";

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(),
    preferences = usePreferences();
  const [message, setMessage] = useState("");
  const focused = pathname === "/first-lesson" || pathname === "/onboarding";
  const navigation = [
    { href: "/learn", title: "Learn", Icon: CompassIcon },
    { href: "/games", title: "Games", Icon: SparklesIcon },
    { href: "/review", title: "Review", Icon: RefreshIcon },
    { href: "/stories", title: "Stories", Icon: BookOpenIcon },
    { href: "/progress", title: "Progress", Icon: ChartIcon },
  ];
  return (
    <div
      data-presentation={preferences.presentation}
      data-entry-focus={focused}
    >
      <a className="skip" href="#main">
        Skip to learning
      </a>
      <header className="site-header">
        <div className="site-header-inner">
          <Link className="brand" href="/">
            <span className="brand-mark" lang="ti" dir="ltr" aria-hidden="true">
              በ
            </span>
            Tigrinya
            <span className="brand-dot" aria-hidden="true">
              •
            </span>
          </Link>
          <nav aria-label="Main navigation">
            {focused ? (
              <Link href="/learn">Leave practice</Link>
            ) : (
              navigation.map(({ href, title, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={
                    pathname === href ||
                    (href === "/learn" && pathname?.startsWith("/learn/"))
                      ? "page"
                      : undefined
                  }
                >
                  <span className="nav-icon">
                    <Icon size={18} />
                  </span>
                  <span>{title}</span>
                </Link>
              ))
            )}
          </nav>
          {!focused && (
            <Dialog
              title="Your pace"
              description="Choose how the app looks. This does not change your learning level."
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="header-settings-btn"
                >
                  <SlidersIcon size={16} />
                  Settings
                </Button>
              }
            >
              <label>
                Presentation
                <select
                  value={preferences.presentation}
                  onChange={(e) =>
                    preferences.set({
                      presentation: e.target.value as
                        | "child"
                        | "teen"
                        | "adult",
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
              <p className="small">No timer. Stop whenever you need.</p>
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
              <p className="small" role="status">
                {preferences.storageError ?? message}
              </p>
            </Dialog>
          )}
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <footer className="site-footer">
        <div className="site-footer-inner">
          <div className="footer-top">
            <p className="footer-tagline">
              Go at your own pace · Warm, honest Tigrinya practice.
            </p>
            {focused && <Link href="/parents">For grown-ups</Link>}
          </div>
          {!focused && (
            <nav aria-label="Account and teaching tools">
              <Link href="/onboarding">Starting plan</Link>
              <Link href="/profile">Profile</Link>
              <Link href="/conversations">Conversations</Link>
              <Link href="/achievements">Achievements</Link>
              <Link href="/parents">Parents</Link>
              <Link href="/teachers">Teachers</Link>
              <Link href="/reviewer">Reviewers</Link>
              <Link href="/admin">Content tools</Link>
              <Link href="/signin">Sign in</Link>
            </nav>
          )}
        </div>
      </footer>
    </div>
  );
}
