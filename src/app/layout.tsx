import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AccessMap",
    template: "%s | AccessMap",
  },
  description:
    "A community-powered platform for discovering, reporting, and resolving accessibility barriers.",
  applicationName: "AccessMap",
  keywords: [
    "accessibility",
    "community",
    "civic technology",
    "accessibility barriers",
    "inclusive design",
  ],
  openGraph: {
    title: "AccessMap",
    description:
      "See barriers. Report them. Create change.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}