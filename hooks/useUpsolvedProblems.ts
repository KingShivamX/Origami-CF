import { useState, useEffect, useCallback, useMemo } from "react";
import useSWR from "swr";
import { TrainingProblem } from "@/types/TrainingProblem";
import useUser from "./useUser";
import useProblems from "./useProblems";

const UPSOLVED_PROBLEMS_CACHE_KEY = "upsolved-problems";

const getStoredUpsolvedProblems = (): TrainingProblem[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(UPSOLVED_PROBLEMS_CACHE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const useUpsolvedProblems = () => {
  const [isClient, setIsClient] = useState(false);
  const { user } = useUser();
  const {
    isLoading: isProblemsLoading,
    refreshSolvedProblems,
    solvedProblems,
  } = useProblems(user);
  const { data, isLoading, error, mutate } = useSWR<TrainingProblem[]>(
    isClient ? UPSOLVED_PROBLEMS_CACHE_KEY : null,
    getStoredUpsolvedProblems
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  // make sure the data is an array
  const upsolvedProblems = useMemo(() => data ?? [], [data]);

  const refreshUpsolvedProblems = useCallback(async () => {
    if (upsolvedProblems?.length === 0) {
      return;
    }
    const newUpsolvedProblems = upsolvedProblems.map((problem) => {
      const solvedProblem = solvedProblems.find(
        (p) => p.contestId === problem.contestId && p.index === problem.index
      );
      if (solvedProblem && !problem.solvedTime) {
        return {
          ...problem,
          solvedTime: Date.now(),
        };
      }
      return problem;
    });

    if (
      JSON.stringify(newUpsolvedProblems) !== JSON.stringify(upsolvedProblems)
    ) {
      await mutate(newUpsolvedProblems, { revalidate: false });
    }
  }, [upsolvedProblems, solvedProblems, mutate]);

  useEffect(() => {
    if (solvedProblems?.length > 0) {
      refreshUpsolvedProblems();
    }
  }, [solvedProblems, refreshUpsolvedProblems]);

  useEffect(() => {
    if (isClient && upsolvedProblems) {
      localStorage.setItem(
        UPSOLVED_PROBLEMS_CACHE_KEY,
        JSON.stringify(upsolvedProblems)
      );
    }
  }, [upsolvedProblems, isClient]);

  const addUpsolvedProblems = (problems: TrainingProblem[]) => {
    const newUpsolvedProblems = [...upsolvedProblems, ...problems];
    mutate(newUpsolvedProblems, { revalidate: false });
  };

  const deleteUpsolvedProblem = (problem: TrainingProblem) => {
    const newUpsolvedProblems = upsolvedProblems.filter(
      (p) => p.contestId !== problem.contestId || p.index !== problem.index
    );
    mutate(newUpsolvedProblems, { revalidate: false });
  };

  const onRefreshUpsolvedProblems = () => {
    refreshSolvedProblems();
  };

  return {
    upsolvedProblems,
    isLoading: isLoading || isProblemsLoading || !isClient,
    error,
    deleteUpsolvedProblem,
    addUpsolvedProblems,
    onRefreshUpsolvedProblems,
  };
};

export default useUpsolvedProblems;
