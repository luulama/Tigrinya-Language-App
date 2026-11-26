import type { Metadata, Viewport } from "next";
import { Providers } from "../components/providers";
import { Shell } from "../components/shell";
import "./globals.css";
import "./entry-systems.css";
import "../../../shared/mascot/neri.css";

export const metadata: Metadata = {
  title: { default: "Tigrinya · Small steps", template: "%s · Tigrinya" },
  description: "Read, write and practise Tigrinya at your own pace.",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Noto+Sans+Ethiopic:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}
