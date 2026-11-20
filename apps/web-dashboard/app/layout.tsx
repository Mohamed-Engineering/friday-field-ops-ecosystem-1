import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Friday | Projects & Field Services",
  description: "Explore Friday projects and request a field visit at your location.",
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
