"use client";

import { TrainingProblem } from "@/types/TrainingProblem";
import useUpsolvedProblems from "@/hooks/useUpsolvedProblems";
import Loader from "@/components/Loader";
import Error from "@/components/Error";
import UpsolvedProblemsList from "@/components/UpsolvedProblemsList";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

export default function UpsolvePage() {
  const {
    upsolvedProblems,
    isLoading,
    error,
    deleteUpsolvedProblem,
    onRefreshUpsolvedProblems,
  } = useUpsolvedProblems();

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <Error />;
  }

  const onDelete = (problem: TrainingProblem) => {
    if (confirm("Are you sure you want to delete this problem?")) {
      deleteUpsolvedProblem(problem);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.section
      className="container flex flex-col gap-10 pb-20 pt-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6"
        variants={itemVariants}
      >
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
            Upsolving <span className="text-accentPrimary">Lab</span>
          </h1>
          <p className="text-lg text-textSecondary font-medium max-w-2xl">
            Analyze your missed opportunities. These problems from past sessions are waiting for your definitive solution.
          </p>
        </div>
        <Button
          variant="outline"
          size="lg"
          onClick={() => onRefreshUpsolvedProblems()}
          className="self-start sm:self-auto h-12 rounded-xl font-bold border-accentPrimary/50 text-accentPrimary hover:bg-accentPrimary hover:text-white transition-all duration-300 shadow-lg shadow-accentPrimary/10 group"
        >
          <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
          Synchronize Status
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        {upsolvedProblems && upsolvedProblems.length > 0 ? (
          <UpsolvedProblemsList
            upsolvedProblems={upsolvedProblems}
            onDelete={onDelete}
          />
        ) : (
          <div className="text-center py-16 text-textSecondary font-medium">
            Your upsolving list is empty. Good job!
          </div>
        )}
      </motion.div>
    </motion.section>
  );
}
