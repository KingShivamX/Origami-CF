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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <NavBar />
            <main className="pt-16 pb-8">
              <AuthGuard>{children}</AuthGuard>
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
