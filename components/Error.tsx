"use client";

import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ErrorProps {
  message?: string;
  onRetry?: () => void;
}

const Error = ({
  message = "An unexpected error occurred.",
  onRetry = () => window.location.reload(),
}: ErrorProps) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center px-4 sm:px-6 lg:px-8 py-[40px] md:py-[80px]"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      <motion.div
        className="max-w-md w-full flex flex-col items-center gap-6"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
        }}
      >
        <div className="h-20 w-20 rounded-2xl bg-destructive/10 flex items-center justify-center mb-2">
          <AlertTriangle className="h-10 w-10 text-destructive animate-pulse" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-[32px] md:text-[40px] font-extrabold leading-[1.1] tracking-tight text-foreground">
            Something went wrong
          </h1>
          <p className="text-[16px] md:text-[18px] text-textSecondary font-medium">
            {message}
          </p>
        </div>

        <motion.div
          className="mt-4"
          variants={{
            hidden: { opacity: 0, scale: 0.95 },
            visible: { opacity: 1, scale: 1, transition: { duration: 0.4, delay: 0.2 } },
          }}
        >
          <Button onClick={onRetry} size="lg" className="px-8 h-12 rounded-xl font-bold bg-accentPrimary hover:bg-accentHover text-white transition-colors border-none">
            <RotateCw className="mr-2 h-5 w-5" />
            Try again
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Error;
