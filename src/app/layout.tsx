import type { Metadata } from "next";
import Script from "next/script";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

export const dynamic = "force-dynamic";

const themeInitializationScript = `
  (() => {
    try {
      const storedTheme = localStorage.getItem("gsi-a2-theme");
      const theme =
        storedTheme === "light" || storedTheme === "dark"
          ? storedTheme
          : window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    } catch {
      document.documentElement.dataset.theme = "light";
    }
  })();
`;

export const metadata: Metadata = {
  title: "GSI A2 Study",
  description: "Study app for GSI A2 practice tests",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-text-primary font-sans">
        <AppShell>{children}</AppShell>
        <Script
          id="theme-initialization"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitializationScript }}
        />
      </body>
    </html>
  );
}
