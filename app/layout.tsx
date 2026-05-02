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
  title: {
    default: "LocalMD | Premium Local-First Markdown Architecture",
    template: "%s | LocalMD"
  },
  description: "Transform PDFs, Word documents, and PPTs into Markdown instantly. A state-of-the-art, privacy-focused editor with Mermaid diagrams, LaTeX, and local-first architecture.",
  keywords: [
    "Markdown Editor", "Privacy-first Markdown", "Local-first Apps",
    "PDF to Markdown", "Word to Markdown", "PPTX to Markdown",
    "Docx to Markdown", "Mermaid Diagrams", "LaTeX Editor",
    "PWA Markdown", "LocalMD", "Next.js Editor"
  ],
  authors: [{ name: "Yash Ghodele", url: "https://yash-ghodele.pages.dev" }],
  creator: "Yash Ghodele",
  category: "technology",
  metadataBase: new URL("https://yash-ghodele.pages.dev/projects/LocalMD"),

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://yash-ghodele.pages.dev/LocalMD",
    title: "LocalMD | Premium Local-First Markdown Architecture",
    description: "Transform PDFs, Word, and PPTs into Markdown instantly. Private, fast, and 100% local-first.",
    siteName: "LocalMD",
    images: [{
      url: "/og-image.png",
      width: 1200,
      height: 630,
      alt: "LocalMD Interface Preview"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LocalMD | Premium Local-First Markdown Architecture",
    description: "The future of private, high-performance Markdown editing.",
    images: ["/og-image.png"],
    creator: "@yash_ghodele",
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  manifest: "/manifest.json",
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
