import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import useUser from "@/hooks/useUser";
import useProblems from "@/hooks/useProblems";
import { TrainingProblem } from "@/types/TrainingProblem";
import { Training } from "@/types/Training";
import { ProblemTag } from "@/types/Codeforces";
import useHistory from "@/hooks/useHistory";
import useUpsolvedProblems from "@/hooks/useUpsolvedProblems";
import getTrainingSubmissionStatus, {
  SubmissionStatus,
} from "@/utils/codeforces/getTrainingSubmissionStatus";

const TRAINING_STORAGE_KEY = "origami-cf-training";
const SUBMISSION_STATUS_STORAGE_KEY = "origami-cf-submission-status";

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
  const [submissionStatuses, setSubmissionStatuses] = useState<
    SubmissionStatus[]
  >([]);
  // Prevents finishTraining from running more than once per contest (e.g. double-fire
  // when useCallback is recreated while the timer effect is still pending)
  const isFinishingRef = useRef(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshProblemStatus = useCallback(async () => {
    if (!user || !training || !isTraining || isRefreshing) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    setIsRefreshing(true);
    try {
      const statusResponse = await getTrainingSubmissionStatus(
        user,
        training.problems,
        training.startTime
      );

      if (statusResponse.success) {
        const newStatuses = statusResponse.data;
        setSubmissionStatuses(newStatuses);

        if (isClient) {
          localStorage.setItem(
            SUBMISSION_STATUS_STORAGE_KEY,
            JSON.stringify(newStatuses)
          );
        }

        // Then, update the solved times based on the new statuses
        const solvedProblemIds = new Set(
          newStatuses.filter((s) => s.status === "AC").map((s) => s.problemId)
        );

        const updatedProblems = training.problems.map((problem) => {
          const problemId = `${problem.contestId}_${problem.index}`;
          const isSolved = solvedProblemIds.has(problemId);
          const submission = newStatuses.find((s) => s.problemId === problemId);

          return {
            ...problem,
            solvedTime: isSolved
              ? (problem.solvedTime ??
                submission?.lastSubmissionTime ??
                Date.now())
              : null,
          };
        });

        if (
          JSON.stringify(updatedProblems) !== JSON.stringify(training.problems)
        ) {
          setTraining((prev) =>
            prev ? { ...prev, problems: updatedProblems } : null
          );
        }
      } else {
        // Handle API errors gracefully
        console.error(
          "Failed to fetch submission status:",
          statusResponse.error
        );
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.error("Refresh timed out");
      } else {
        console.error("Failed to refresh problem status:", error);
      }
    } finally {
      clearTimeout(timeoutId);
      setIsRefreshing(false);
    }
  }, [user, training, isTraining, isClient]);

  const finishTraining = useCallback(async () => {
    // Guard: only one finishTraining can run at a time per contest
    if (isFinishingRef.current) return;
    isFinishingRef.current = true;

    setIsTraining(false);

    if (!training) {
      isFinishingRef.current = false;
      return;
    }

    // Check if we're finishing during pre-contest period
    const now = Date.now();
    const isPreContestPeriod = now < training.startTime;

    if (isPreContestPeriod) {
      setProblems([]);
      setTraining(null);
      setSubmissionStatuses([]);
      if (isClient) {
        localStorage.removeItem(TRAINING_STORAGE_KEY);
        localStorage.removeItem(SUBMISSION_STATUS_STORAGE_KEY);
      }
      isFinishingRef.current = false;
      router.push("/contest");
      return;
    }

    // Snapshot the training data locally before any state/storage changes
    const currentTraining = { ...training };

    // Clear React state (UI) immediately so the user doesn't see a stale contest
    setProblems([]);
    setTraining(null);
    setSubmissionStatuses([]);
    // ⚠️  Do NOT clear localStorage yet — we need it as a safety net if the
    //     API call below fails (e.g. network error, server error). We will clear
    //     it only after a successful save.

    // --- Resolve the user object ---
    // `user` from the hook may still be null if the page just loaded (race with
    // async token validation). Read the stored user from localStorage as a
    // reliable fallback — it is always written on login and kept in sync.
    let resolvedUser = user;
    if (!resolvedUser && isClient) {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) resolvedUser = JSON.parse(storedUser);
      } catch {
        // ignore parse errors
      }
    }

    if (!resolvedUser) {
      // Still no user (not logged in) — restore localStorage so the training
      // is not lost, and bail.
      if (isClient) {
        localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify(currentTraining));
      }
      isFinishingRef.current = false;
      return;
    }

    // Fetch final submission statuses from Codeforces
    const statusResponse = await getTrainingSubmissionStatus(
      resolvedUser,
      currentTraining.problems,
      currentTraining.startTime
    );

    let finalProblems = currentTraining.problems;
    if (statusResponse.success) {
      const newStatuses = statusResponse.data;
      const solvedProblemIds = new Set(
        newStatuses.filter((s) => s.status === "AC").map((s) => s.problemId)
      );
      finalProblems = currentTraining.problems.map((problem) => {
        const problemId = `${problem.contestId}_${problem.index}`;
        const isSolved = solvedProblemIds.has(problemId);
        const submission = newStatuses.find((s) => s.problemId === problemId);
        return {
          ...problem,
          solvedTime: isSolved
            ? (problem.solvedTime ??
              submission?.lastSubmissionTime ??
              Date.now())
            : null,
        };
      });
    }

    // Save to the database
    const saved = await addTraining({ ...currentTraining, problems: finalProblems });

    if (saved !== null) {
      // ✅ Successfully saved — now it's safe to clear localStorage
      if (isClient) {
        localStorage.removeItem(TRAINING_STORAGE_KEY);
        localStorage.removeItem(SUBMISSION_STATUS_STORAGE_KEY);
      }
    } else {
      // ❌ Save failed — keep the training in localStorage so the next page
      //    load will retry finishing the contest automatically.
      if (isClient) {
        localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify(currentTraining));
      }
      console.error("Failed to save training — data preserved in localStorage for retry.");
      isFinishingRef.current = false;
      return;
    }

    // Add unsolved problems to the upsolve queue (excluding globally CF-solved ones)
    const globalSolvedIds = new Set(
      (solvedProblems ?? []).map((p) => `${p.contestId}_${p.index}`)
    );
    const unsolvedProblems = finalProblems.filter(
      (p) => p.solvedTime == null && !globalSolvedIds.has(`${p.contestId}_${p.index}`)
    );
    addUpsolvedProblems(unsolvedProblems);

    isFinishingRef.current = false;
    router.push("/history");
  }, [training, addTraining, router, addUpsolvedProblems, isClient, user, solvedProblems]);

  // Redirect if no user (only after loading is complete)
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/");
    }
  }, [user, isUserLoading, router]);

  // Load training and submission statuses from localStorage (only on client)
  useEffect(() => {
    if (!isClient) return;

    const localTraining = localStorage.getItem(TRAINING_STORAGE_KEY);
    if (localTraining) {
      const parsed = JSON.parse(localTraining);
      setTraining(parsed);
    }

    const localSubmissionStatuses = localStorage.getItem(
      SUBMISSION_STATUS_STORAGE_KEY
    );
    if (localSubmissionStatuses) {
      const parsed = JSON.parse(localSubmissionStatuses);
      setSubmissionStatuses(parsed);
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
      // Don't call finishTraining until the user object is available.
      // isUserLoading is true while the token is being validated — wait for it.
      // Once user is resolved the effect will re-run and finishTraining will fire.
      if (isUserLoading) return;
      finishTraining();
      return;
    }

    setIsTraining(now <= training.endTime);

    const timer = setTimeout(finishTraining, timeLeft);

    return () => {
      clearTimeout(timer);
    };
  }, [training, isClient, finishTraining]);

  // Auto-refresh on component mount and when window regains focus
  useEffect(() => {
    if (isTraining) {
      refreshProblemStatus(); // Initial refresh

      const handleFocus = () => refreshProblemStatus();
      window.addEventListener("focus", handleFocus);

      return () => {
        window.removeEventListener("focus", handleFocus);
      };
    }
  }, [isTraining, refreshProblemStatus]);

  const startTraining = useCallback(
    (customRatings: { P1: number; P2: number; P3: number; P4: number }) => {
      if (!user) {
        router.push("/");
        return;
      }

      const contestTime = 120; // 120 minutes
      const preContestDuration = 10 * 1000; // Fixed 10 seconds in milliseconds
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
    setSubmissionStatuses([]);
    if (isClient) {
      localStorage.removeItem(TRAINING_STORAGE_KEY);
      localStorage.removeItem(SUBMISSION_STATUS_STORAGE_KEY);
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
    isRefreshing,
    training,
    isTraining,
    submissionStatuses,
    generateProblems,
    startTraining,
    stopTraining,
    refreshProblemStatus,
    finishTraining,
  };
};

export default useTraining;
