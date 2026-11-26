import type { Metadata, Viewport } from "next";
import { Providers } from "../components/providers";
import { Shell } from "../components/shell";
import "./fonts.css";
import "./globals.css";
import "./entry-systems.css";
import "../../../shared/mascot/neri.css";

export const metadata: Metadata = {
  title: { default: "Tigrinya · Small steps", template: "%s · Tigrinya" },
  description: "Read, write and practise Tigrinya at your own pace.",
  icons: {
    icon: {
      url: "/preview/shared/mascot/assets/neri-idle.svg",
      type: "image/svg+xml",
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf6ee",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}
