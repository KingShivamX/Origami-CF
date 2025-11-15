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

  if (res.status === 401) {
    // Token expired, clear localStorage and reload page
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
    throw new Error("Authentication expired");
  }

  if (!res.ok) {
    throw new Error("Failed to fetch custom problems");
  }

  return res.json();
};

const useCustomProblems = () => {
  const [isClient, setIsClient] = useState(false);
  const { user } = useUser();
  const {
    isLoading: isProblemsLoading,
    refreshSolvedProblems,
    solvedProblems,
  } = useProblems(user);

  const { data, isLoading, error, mutate } = useSWR<TrainingProblem[]>(
    isClient && user ? "/api/saved" : null,
    fetcher
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  const customProblems = useMemo(() => {
    const problems = data ?? [];
    // Keep the original order as they were added to the database
    return problems;
  }, [data]);

  const refreshCustomProblems = useCallback(async () => {
    if (customProblems.length === 0 || solvedProblems.length === 0) {
      return;
    }

    const newlySolved = customProblems
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
      customProblems.map(
        (p) =>
          newlySolved.find(
            (ns) => ns.contestId === p.contestId && ns.index === p.index
          ) || p
      ),
      false
    );

    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/saved", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newlySolved),
      });

      if (response.status === 401) {
        // Token expired, clear localStorage and reload page
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.reload();
        return;
      }

      // Revalidate to get final state from server
      mutate();
    } catch (error) {
      console.error("Failed to update solved status:", error);
      mutate(); // Rollback on error
    }
  }, [customProblems, solvedProblems, mutate]);

  useEffect(() => {
    if (solvedProblems?.length > 0) {
      refreshCustomProblems();
    }
  }, [solvedProblems, refreshCustomProblems]);

  const addCustomProblem = useCallback(
    async (problem: TrainingProblem) => {
      if (!isClient) return;

      // Optimistic update - append new problem at the end
      mutate((currentData = []) => {
        return [...currentData, problem];
      }, false);

      const token = localStorage.getItem("token");
      try {
        const response = await fetch("/api/saved", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(problem),
        });

        if (response.status === 401) {
          // Token expired, clear localStorage and reload page
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.reload();
          return;
        }

        // Revalidate to sync with the database
        mutate();
      } catch (error) {
        console.error(error);
        mutate(); // Rollback
      }
    },
    [isClient, mutate]
  );

  const deleteCustomProblem = useCallback(
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
        const response = await fetch("/api/saved", {
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

        if (response.status === 401) {
          // Token expired, clear localStorage and reload page
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.reload();
          return;
        }

        // No revalidation needed on success
      } catch (error) {
        console.error(error);
        mutate(); // Rollback
      }
    },
    [isClient, mutate]
  );

  const onRefreshCustomProblems = useCallback(() => {
    refreshSolvedProblems();
  }, [refreshSolvedProblems]);

  return {
    customProblems,
    isLoading: isLoading || isProblemsLoading || !isClient,
    error,
    addCustomProblem,
    deleteCustomProblem,
    onRefreshCustomProblems,
  };
};

export default useCustomProblems;
