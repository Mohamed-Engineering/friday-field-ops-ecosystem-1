import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Friday Field Operations",
  description: "Unified private operations and public workflow portal",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
