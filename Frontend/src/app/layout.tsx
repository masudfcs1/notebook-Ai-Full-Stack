import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NoteFlow AI — AI Meeting Notes Summarizer",
  description: "Upload meeting notes, generate AI-powered summaries, and extract actionable tasks automatically.",
  keywords: ["AI", "Meeting Notes", "Summarizer", "Action Items", "SaaS"],
  authors: [{ name: "NoteFlow AI" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
          <SonnerToaster position="bottom-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
