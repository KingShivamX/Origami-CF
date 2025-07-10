import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import useUser from "@/hooks/useUser";
import useProblems from "@/hooks/useProblems";
import { TrainingProblem } from "@/types/TrainingProblem";
import { Training } from "@/types/Training";
import { ProblemTag } from "@/types/Codeforces";
import useHistory from "@/hooks/useHistory";
import useUpsolvedProblems from "@/hooks/useUpsolvedProblems";

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

  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const updateProblemStatus = useCallback(() => {
    if (!training || !solvedProblems) {
      return;
    }

    const solvedProblemIds = new Set(
      solvedProblems.map((p) => `${p.contestId}_${p.index}`)
    );

    const updatedProblems = training.problems.map((problem) => ({
      ...problem,
      solvedTime: solvedProblemIds.has(`${problem.contestId}_${problem.index}`)
        ? (problem.solvedTime ?? Date.now())
        : problem.solvedTime,
    }));

    setTraining((prev) =>
      prev ? { ...prev, problems: updatedProblems } : null
    );
  }, [training, solvedProblems]);

  const refreshProblemStatus = useCallback(() => {
    refreshSolvedProblems();
  }, [refreshSolvedProblems]);

  const finishTraining = useCallback(async () => {
    // Immediately set training state to false to prevent any race conditions
    setIsTraining(false);

    // Clear any existing timer first
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }

    // Capture current training value before clearing state
    const currentTraining = training;

    // Clear all training-related states immediately
    setProblems([]);
    setTraining(null);
    if (isClient) {
      localStorage.removeItem(TRAINING_STORAGE_KEY);
    }

    // Only proceed with history update if there was an active training
    if (!currentTraining) {
      return;
    }

    const latestSolvedProblems = await refreshSolvedProblems();

    if (!latestSolvedProblems) {
      return;
    }

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

    // Add unsolved problems to upsolved problems list
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

  // Redirect if no user
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

  // Update training in localStorage
  useEffect(() => {
    if (!isClient) return;

    if (!training) {
      // Ensure cleanup when training becomes null
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
      return;
    }

    localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify(training));
    const now = Date.now();
    const timeLeft = training.endTime - now;

    // If training has expired, finish it
    if (timeLeft <= 0) {
      finishTraining();
      return;
    }

    setIsTraining(now <= training.endTime);

    // Store timer ID in the ref
    timerRef.current = setTimeout(() => {
      finishTraining();
    }, timeLeft);

    // Clean up timer when training changes or component unmounts
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
    };
  }, [training, finishTraining, isClient]);

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

    updateProblemStatus();
  }, [isTraining, training, solvedProblems, updateProblemStatus]);

  const startTraining = (
    customRatings: { P1: number; P2: number; P3: number; P4: number },
    contestTime: number
  ) => {
    if (!user) {
      router.push("/");
      return;
    }

    // Will start in 10 seconds
    const startTime = Date.now() + 10000;
    const endTime = startTime + contestTime * 60000;

    setTraining({
      startTime,
      endTime,
      customRatings,
      contestTime,
      problems,
      performance: 0,
    });
  };

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
