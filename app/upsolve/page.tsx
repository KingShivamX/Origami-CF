"use client";

import { TrainingProblem } from "@/types/TrainingProblem";
import useUpsolvedProblems from "@/hooks/useUpsolvedProblems";
import Loader from "@/components/Loader";
import Error from "@/components/Error";
import UpsolvedProblemsList from "@/components/UpsolvedProblemsList";
import { Button } from "@/components/ui/button";

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

  return (
    <section className="container grid items-center gap-6 pb-6 pt-2 md:py-4">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold leading-tight tracking-tight">
            Upsolving List
          </h1>
          <p className="text-sm text-muted-foreground">
            Here are the problems you didn&apos;t solve during your training
            sessions.
          </p>
        </div>
        <Button variant="outline" onClick={onRefreshUpsolvedProblems}>
          Refresh Status
        </Button>
      </div>

      {upsolvedProblems && upsolvedProblems.length > 0 ? (
        <UpsolvedProblemsList
          upsolvedProblems={upsolvedProblems}
          onDelete={onDelete}
        />
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          Your upsolving list is empty. Good job!
        </div>
      )}
    </section>
  );
}
