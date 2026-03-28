"use client";

import { useEffect } from "react";
import ErrorComponent from "@/components/Error";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return <ErrorComponent message={error.message} onRetry={reset} />;
}
