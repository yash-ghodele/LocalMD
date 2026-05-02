import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "highlight.js/styles/github-dark.css";
import "katex/dist/katex.min.css";
import "./github-alerts.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Local Markdown Viewer",
  description: "A fast, secure, and privacy-focused local-first Markdown viewer and editor. All your data stays on your device.",
  keywords: ["Markdown", "Viewer", "Editor", "Local-first", "Privacy", "Developer Tools", "Next.js", "PWA"],
  authors: [{ name: "Yash Ghodele", url: "https://github.com/yash-ghodele" }],
  creator: "Yash Ghodele",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://localmd.vercel.app",
    title: "Local Markdown Viewer",
    description: "Privacy-focused local-first Markdown viewer and editor",
    siteName: "Local Markdown Viewer",
  },
  twitter: {
    card: "summary_large_image",
    title: "Local Markdown Viewer",
    description: "Privacy-focused local-first Markdown viewer and editor",
    creator: "@yash_ghodele",
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={cn(inter.className, "min-h-screen bg-background font-sans antialiased")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
