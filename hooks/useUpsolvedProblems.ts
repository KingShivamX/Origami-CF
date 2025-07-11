import { useState, useEffect, useCallback, useMemo } from "react";
import useSWR from "swr";
import { TrainingProblem } from "@/types/TrainingProblem";
import useUser from "./useUser";
import useProblems from "./useProblems";

const fetcher = async (url: string) => {
  if (typeof window === "undefined") return [];

  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No token found");
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch upsolved problems");
  }

  return res.json();
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
    isClient && user ? "/api/upsolve" : null,
    fetcher
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  const upsolvedProblems = useMemo(() => data ?? [], [data]);

  const refreshUpsolvedProblems = useCallback(async () => {
    if (upsolvedProblems.length === 0 || solvedProblems.length === 0) {
      return;
    }

    const newlySolved = upsolvedProblems
      .filter((p) => !p.solvedTime) // only check unsolved problems
      .filter((p) =>
        solvedProblems.some(
          (sp) => sp.contestId === p.contestId && sp.index === p.index
        )
      )
      .map((p) => ({ ...p, solvedTime: Date.now() }));

    if (newlySolved.length === 0) return;

    // Optimistic UI update
    mutate(
      upsolvedProblems.map(
        (p) =>
          newlySolved.find(
            (ns) => ns.contestId === p.contestId && ns.index === p.index
          ) || p
      ),
      false
    );

    const token = localStorage.getItem("token");
    try {
      await fetch("/api/upsolve", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newlySolved),
      });
      // Revalidate to get final state from server
      mutate();
    } catch (error) {
      console.error("Failed to update solved status:", error);
      mutate(); // Rollback on error
    }
  }, [upsolvedProblems, solvedProblems, mutate]);

  useEffect(() => {
    if (solvedProblems?.length > 0) {
      refreshUpsolvedProblems();
    }
  }, [solvedProblems, refreshUpsolvedProblems]);

  const addUpsolvedProblems = useCallback(
    async (problems: TrainingProblem[]) => {
      if (!isClient || problems.length === 0) return;

      // Optimistic update
      mutate((currentData = []) => [...currentData, ...problems], false);

      const token = localStorage.getItem("token");
      try {
        await fetch("/api/upsolve", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(problems),
        });
        // Revalidate to sync with the database
        mutate();
      } catch (error) {
        console.error(error);
        mutate(); // Rollback
      }
    },
    [isClient, mutate]
  );

  const deleteUpsolvedProblem = useCallback(
    async (problem: TrainingProblem) => {
      if (!isClient) return;

      // Optimistic update
      mutate(
        (currentData = []) =>
          currentData.filter(
            (p) =>
              p.contestId !== problem.contestId || p.index !== problem.index
          ),
        false
      );

      const token = localStorage.getItem("token");
      try {
        await fetch("/api/upsolve", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            contestId: problem.contestId,
            index: problem.index,
          }),
        });
        // No revalidation needed on success
      } catch (error) {
        console.error(error);
        mutate(); // Rollback
      }
    },
    [isClient, mutate]
  );

  const onRefreshUpsolvedProblems = useCallback(() => {
    refreshSolvedProblems();
  }, [refreshSolvedProblems]);

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
