import type { Metadata } from "next";
import { Providers } from "../components/providers";
import { Shell } from "../components/shell";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "Tigrinya · Small steps", template: "%s · Tigrinya" },
  description: "Read, write and practise Tigrinya at your own pace.",
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
