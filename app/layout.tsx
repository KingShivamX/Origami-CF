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
  title: "Origami-CF",
  description: "A Codeforces virtual contest practice website.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
