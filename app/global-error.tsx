"use client";

import { Inter } from "next/font/google";
import "@/app/globals.css";
import ErrorComponent from "@/components/Error";

const inter = Inter({ subsets: ["latin"] });

export default function GlobalError({
    _error,
    reset,
}: {
    _error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.className} bg-background text-foreground antialiased selection:bg-accentPrimary/30`}>
                <div className="flex min-h-screen flex-col items-center justify-center">
                    <ErrorComponent
                        message="A critical system error occurred. We're working to fix it."
                        onRetry={reset}
                    />
                </div>
            </body>
        </html>
    );
}
