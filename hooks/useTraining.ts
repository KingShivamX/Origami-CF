import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import useUser from "@/hooks/useUser";
import useProblems from "@/hooks/useProblems";
import { TrainingProblem } from "@/types/TrainingProblem";
import { Training } from "@/types/Training";
import { ProblemTag } from "@/types/Codeforces";
import useHistory from "@/hooks/useHistory";
import useUpsolvedProblems from "@/hooks/useUpsolvedProblems";
import { start } from "repl";

const TRAINING_STORAGE_KEY = "training-tracker-training";

const useTraining = () => {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const {
    solvedProblems,
    isLoading: isProblemsLoading,
    refreshSolvedProblems,
    getRandomProblems,
  } = useProblems(user);
  const { addTraining } = useHistory();
  const { addUpsolvedProblems } = useUpsolvedProblems();

  const [isClient, setIsClient] = useState(false);
  const [problems, setProblems] = useState<TrainingProblem[]>([]);
  const [training, setTraining] = useState<Training | null>(null);
  const [isTraining, setIsTraining] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const updateProblemStatus = useCallback(
    (currentSolvedProblems: any[]) => {
      if (!training) return;

      const solvedProblemIds = new Set(
        currentSolvedProblems.map((p) => `${p.contestId}_${p.index}`)
      );

      const updatedProblems = training.problems.map((problem) => ({
        ...problem,
        solvedTime: solvedProblemIds.has(
          `${problem.contestId}_${problem.index}`
        )
          ? (problem.solvedTime ?? Date.now())
          : problem.solvedTime,
      }));

      // Check if there are actual changes before setting the state
      if (
        JSON.stringify(updatedProblems) !== JSON.stringify(training.problems)
      ) {
        setTraining((prev) =>
          prev ? { ...prev, problems: updatedProblems } : null
        );
      }
    },
    [training]
  );

  const refreshProblemStatus = useCallback(() => {
    refreshSolvedProblems();
  }, [refreshSolvedProblems]);

  const finishTraining = useCallback(async () => {
    // Immediately set training state to false to prevent any race conditions
    setIsTraining(false);

    if (!training) return;

    // Check if we're finishing during pre-contest period
    const now = Date.now();
    const isPreContestPeriod = now < training.startTime;

    if (isPreContestPeriod) {
      // If finished during pre-contest period, just clear states without saving
      setProblems([]);
      setTraining(null);
      if (isClient) {
        localStorage.removeItem(TRAINING_STORAGE_KEY);
      }
      router.push("/training");
      return;
    }

    // Use a local copy of training for the async operations
    const currentTraining = { ...training };

    // Clear all training-related states immediately
    setProblems([]);
    setTraining(null);
    if (isClient) {
      localStorage.removeItem(TRAINING_STORAGE_KEY);
    }

    const latestSolvedProblems = await refreshSolvedProblems();
    if (!latestSolvedProblems) return;

    const solvedProblemIds = new Set(
      latestSolvedProblems.map((p) => `${p.contestId}_${p.index}`)
    );

    const updatedProblems = currentTraining.problems.map((problem) => ({
      ...problem,
      solvedTime: solvedProblemIds.has(`${problem.contestId}_${problem.index}`)
        ? (problem.solvedTime ?? Date.now())
        : problem.solvedTime,
    }));

    addTraining({ ...currentTraining, problems: updatedProblems });

    const unsolvedProblems = updatedProblems.filter((p) => !p.solvedTime);
    addUpsolvedProblems(unsolvedProblems);

    router.push("/statistics");
  }, [
    training,
    addTraining,
    router,
    refreshSolvedProblems,
    addUpsolvedProblems,
    isClient,
  ]);

  // Redirect if no user (only after loading is complete)
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/");
    }
  }, [user, isUserLoading, router]);

  // Load training from localStorage (only on client)
  useEffect(() => {
    if (!isClient) return;

    const localTraining = localStorage.getItem(TRAINING_STORAGE_KEY);
    if (localTraining) {
      const parsed = JSON.parse(localTraining);
      setTraining(parsed);
    }
  }, [isClient]);

  // Update training in localStorage and handle timer
  useEffect(() => {
    if (!isClient || !training) {
      return;
    }

    localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify(training));
    const now = Date.now();
    const timeLeft = training.endTime - now;

    if (timeLeft <= 0) {
      finishTraining();
      return;
    }

    setIsTraining(now <= training.endTime);

    const timer = setTimeout(finishTraining, timeLeft);

    return () => {
      clearTimeout(timer);
    };
  }, [training, isClient, finishTraining]);

  // if all problems are solved, finish training
  useEffect(() => {
    if (training && training.problems.every((p) => p.solvedTime)) {
      finishTraining();
    }
  }, [training, finishTraining]);

  // Update training problems status whenever solvedProblems changes
  useEffect(() => {
    if (!isTraining || !training || !solvedProblems) {
      return;
    }

    updateProblemStatus(solvedProblems);
  }, [isTraining, solvedProblems, updateProblemStatus, training]);

  const startTraining = useCallback(
    (customRatings: { P1: number; P2: number; P3: number; P4: number }) => {
      if (!user) {
        router.push("/");
        return;
      }

      const contestTime = 120; // 120 minutes
      const preContestDuration = 30 * 1000; // Fixed 30 seconds in milliseconds
      const startTime = Date.now() + preContestDuration;
      const endTime = startTime + contestTime * 60000;

      setTraining({
        startTime,
        endTime,
        customRatings,
        problems,
        performance: 0,
      });
    },
    [user, problems, router]
  );

  const stopTraining = () => {
    setIsTraining(false);
    setTraining(null);
    if (isClient) {
      localStorage.removeItem(TRAINING_STORAGE_KEY);
    }
  };

  const generateProblems = (
    tags: ProblemTag[],
    lb: number,
    ub: number,
    customRatings: { P1: number; P2: number; P3: number; P4: number }
  ) => {
    const newProblems = getRandomProblems(tags, lb, ub, customRatings);
    if (newProblems) {
      setProblems(newProblems);
    }
  };

  return {
    problems,
    isLoading: isUserLoading || isProblemsLoading || !isClient,
    training,
    isTraining,
    generateProblems,
    startTraining,
    stopTraining,
    refreshProblemStatus,
    finishTraining,
  };
};

export default useTraining;
