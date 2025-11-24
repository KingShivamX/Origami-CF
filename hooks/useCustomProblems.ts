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
    if (customProblems.length === 0) {
      return;
    }

    try {
      // Fetch latest problem data from Codeforces API
      const response = await fetch(
        `https://codeforces.com/api/problemset.problems`
      );
      const data = await response.json();

      if (data.status !== "OK") {
        console.error("Failed to fetch problem details from Codeforces");
        return;
      }

      const updates: TrainingProblem[] = [];

      // Check each custom problem for solve status and rating updates
      for (const problem of customProblems) {
        let needsUpdate = false;
        const updatedProblem = { ...problem };

        // Check if problem is newly solved
        if (!problem.solvedTime && solvedProblems.length > 0) {
          const isSolved = solvedProblems.some(
            (sp) =>
              sp.contestId === problem.contestId && sp.index === problem.index
          );
          if (isSolved) {
            updatedProblem.solvedTime = Date.now();
            needsUpdate = true;
          }
        }

        // Check if problem has gotten a rating (or rating has changed)
        const cfProblem = data.result.problems.find(
          (p: any) =>
            p.contestId === problem.contestId && p.index === problem.index
        );

        if (
          cfProblem &&
          cfProblem.rating &&
          cfProblem.rating !== problem.rating
        ) {
          updatedProblem.rating = cfProblem.rating;
          needsUpdate = true;
        }

        if (needsUpdate) {
          updates.push(updatedProblem);
        }
      }

      if (updates.length === 0) return;

      // Optimistic UI update
      mutate(
        customProblems.map(
          (p) =>
            updates.find(
              (u) => u.contestId === p.contestId && u.index === p.index
            ) || p
        ),
        false
      );

      const token = localStorage.getItem("token");
      const updateResponse = await fetch("/api/saved", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (updateResponse.status === 401) {
        // Token expired, clear localStorage and reload page
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.reload();
        return;
      }

      // Revalidate to get final state from server
      mutate();
    } catch (error) {
      console.error("Failed to update problems:", error);
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
