import * as React from "react";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import AuthGuard from "@/components/AuthGuard";
import NavBar from "@/components/NavBar";
import ThemeProvider from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
});

const monda = localFont({
  src: [
    {
      path: "./fonts/Monda-VariableFont_wght.ttf",
      style: "normal",
    },
    {
      path: "./fonts/Monda-Bold.ttf",
      style: "normal",
      weight: "700",
    },
  ],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Origami-CF - Codeforces Virtual Contest Practice Platform",
  description:
    "Practice Codeforces problems with virtual contests, track your progress, and improve your competitive programming skills. Create custom training sessions with problem ratings and tags.",
  keywords: [
    "Codeforces",
    "competitive programming",
    "virtual contest",
    "practice problems",
    "algorithm practice",
    "programming contest",
    "CP practice",
    "coding practice",
    "algorithm problems",
    "competitive coding",
    "ThemeCP",
    "ThemeCP-CF",
    "ThemeCP-CF-Practice",
    "ThemeCP-CF-Practice-Platform",
    "ThemeCP-CF-Practice-Platform-Codeforces",
    "ThemeCP-CF-Practice-Platform-Codeforces-Virtual-Contest",
    "ThemeCP-CF-Practice-Platform-Codeforces-Virtual-Contest-Practice",
    "ThemeCP-CF-Practice-Platform-Codeforces-Virtual-Contest-Practice-Platform",
    "training tracker",
    "training tracker",
  ],
  authors: [{ name: "Origami-CF Team" }],
  creator: "Origami-CF",
  publisher: "Origami-CF",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://origami-cf.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Origami-CF - Codeforces Virtual Contest Practice Platform",
    description:
      "Practice Codeforces problems with virtual contests, track your progress, and improve your competitive programming skills.",
    url: "https://origami-cf.vercel.app",
    siteName: "Origami-CF",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Origami-CF - Codeforces Practice Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Origami-CF - Codeforces Virtual Contest Practice Platform",
    description:
      "Practice Codeforces problems with virtual contests, track your progress, and improve your competitive programming skills.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // Replace with actual verification code
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Origami-CF",
    description:
      "A Codeforces virtual contest practice platform for competitive programming",
    url: "https://origami-cf.vercel.app",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Organization",
      name: "Origami-CF Team",
    },
    keywords:
      "Codeforces, competitive programming, virtual contest, practice problems, algorithm practice",
    featureList: [
      "Custom virtual contests",
      "Problem rating selection",
      "Progress tracking",
      "Statistics and analytics",
      "Upsolving list",
      "Tag-based problem selection",
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body
        className={cn(
          "bg-background font-sans antialiased",
          montserrat.variable,
          monda.variable
        )}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col bg-background overflow-x-hidden">
            <NavBar />
            <main className="flex-1">
              <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 max-w-7xl">
                <AuthGuard>{children}</AuthGuard>
              </div>
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
