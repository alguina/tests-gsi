import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GSI A2 Study Parser",
  description: "Local Preparatic test parser preview for GSI A2 study data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
