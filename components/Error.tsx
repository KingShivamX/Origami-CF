"use client";

import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  message?: string;
  onRetry?: () => void;
}

const Error = ({
  message = "An unexpected error occurred.",
  onRetry = () => window.location.reload(),
}: ErrorProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive animate-pulse" />
        <h1 className="mt-4 text-4xl font-extrabold text-foreground tracking-tight sm:text-5xl">
          Something went wrong
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{message}</p>
        <div className="mt-8">
          <Button onClick={onRetry} size="lg" variant="outline">
            <RotateCw className="mr-2 h-5 w-5" />
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Error;
