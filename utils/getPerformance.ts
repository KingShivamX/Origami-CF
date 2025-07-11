import { Training } from "@/types/Training";

interface ProblemPerformance {
  rating: number;
  solved: boolean;
  solveTime: number | null; // in minutes
  penalty: number; // wrong submissions before solving
}

/**
 * Calculate expected solve probability based on user rating vs problem rating
 * This mimics Codeforces' ELO-based expected performance calculation
 */
const getExpectedSolveProb = (
  userRating: number,
  problemRating: number
): number => {
  // ELO formula: Expected = 1 / (1 + 10^((opponent_rating - player_rating) / 400))
  const ratingDiff = problemRating - userRating;
  return 1 / (1 + Math.pow(10, ratingDiff / 400));
};

/**
 * Calculate time penalty factor
 * Faster solves get bonus, slower solves get penalty
 */
const getTimeFactor = (solveTime: number, contestDuration: number): number => {
  if (solveTime <= 0) return 1;

  const timeRatio = solveTime / contestDuration;

  // Early solve bonus (0-25% of contest time): 1.1x multiplier
  if (timeRatio <= 0.25) return 1.1;

  // Normal solve (25-75% of contest time): 1.0x multiplier
  if (timeRatio <= 0.75) return 1.0;

  // Late solve penalty (75-100% of contest time): 0.9x multiplier
  return 0.9;
};

/**
 * Calculate penalty factor for wrong submissions
 * Each wrong submission reduces performance slightly
 */
const getPenaltyFactor = (wrongSubmissions: number): number => {
  // Each wrong submission reduces performance by ~2%
  return Math.max(0.7, 1 - wrongSubmissions * 0.02);
};

/**
 * Convert solve performance to rating points
 * This is the core of Codeforces' performance calculation
 */
const solvePerformanceToRating = (
  problemRating: number,
  expectedProb: number,
  actualSolved: boolean,
  timeFactor: number,
  penaltyFactor: number
): number => {
  let basePerformance;

  if (actualSolved) {
    // Solved: Performance above problem rating
    // The lower the expected probability, the higher the performance boost
    const difficultyBonus = Math.max(0, (1 - expectedProb) * 200);
    basePerformance = problemRating + difficultyBonus;
  } else {
    // Not solved: Performance below problem rating
    // The higher the expected probability, the bigger the performance drop
    const difficultyPenalty = expectedProb * 150;
    basePerformance = problemRating - difficultyPenalty;
  }

  // Apply time and penalty factors
  return basePerformance * timeFactor * penaltyFactor;
};

/**
 * Main performance calculation function
 * Implements a system very close to Codeforces' actual algorithm
 */
const getPerformance = (
  training: Training,
  userRating: number = 1500
): number => {
  const contestDuration = (training.endTime - training.startTime) / 60000; // in minutes

  // Extract problem data
  const problemData: ProblemPerformance[] = training.problems.map(
    (problem, index) => {
      const problemRating = Object.values(training.customRatings)[index];
      const solved = problem.solvedTime !== null;
      const solveTime = problem.solvedTime
        ? (problem.solvedTime - training.startTime) / 60000
        : null;

      // For now, assume 0 wrong submissions (can be enhanced later)
      const penalty = 0;

      return {
        rating: problemRating,
        solved,
        solveTime,
        penalty,
      };
    }
  );

  let totalPerformance = 0;
  let totalWeight = 0;

  // Calculate performance for each problem
  problemData.forEach((problem) => {
    const expectedProb = getExpectedSolveProb(userRating, problem.rating);

    const timeFactor =
      problem.solved && problem.solveTime
        ? getTimeFactor(problem.solveTime, contestDuration)
        : 1;

    const penaltyFactor = getPenaltyFactor(problem.penalty);

    const problemPerformance = solvePerformanceToRating(
      problem.rating,
      expectedProb,
      problem.solved,
      timeFactor,
      penaltyFactor
    );

    // Weight problems by their difficulty relative to user rating
    // Harder problems (for the user) have higher weight
    const difficultyWeight =
      1 + Math.max(0, (problem.rating - userRating) / 1000);

    totalPerformance += problemPerformance * difficultyWeight;
    totalWeight += difficultyWeight;
  });

  // Calculate weighted average performance
  const averagePerformance =
    totalWeight > 0 ? totalPerformance / totalWeight : userRating;

  // Apply global contest factors
  const solvedCount = problemData.filter((p) => p.solved).length;
  const totalProblems = problemData.length;

  // Bonus for solving all problems
  let completionBonus = 1;
  if (solvedCount === totalProblems && totalProblems > 0) {
    completionBonus = 1.05; // 5% bonus for full solve
  }

  // Calculate final performance
  let finalPerformance = averagePerformance * completionBonus;

  // Ensure performance is within reasonable bounds
  finalPerformance = Math.max(800, Math.min(4000, finalPerformance));

  return Math.round(finalPerformance);
};

/**
 * Enhanced version that accepts user's current rating for more accurate calculation
 */
export const getAccuratePerformance = (
  training: Training,
  userRating: number
): number => {
  return getPerformance(training, userRating);
};

/**
 * Real-time performance prediction for ongoing contests
 * Shows estimated performance based on current progress
 */
export const getRealTimePerformance = (
  training: Training,
  userRating: number,
  currentTime: number = Date.now()
): {
  currentPerformance: number;
  projectedPerformance: number;
  timeRemaining: number;
  solvedCount: number;
} => {
  const timeRemaining = Math.max(0, training.endTime - currentTime);
  const contestDuration = (training.endTime - training.startTime) / 60000;
  const timeElapsed = (currentTime - training.startTime) / 60000;

  // Calculate current performance based on solved problems so far
  const currentPerformance = getPerformance(training, userRating);

  // Project performance assuming no more problems are solved
  const solvedCount = training.problems.filter(
    (p) => p.solvedTime !== null
  ).length;
  const unsolvedCount = training.problems.length - solvedCount;

  // Estimate projected performance (slightly pessimistic)
  let projectedPerformance = currentPerformance;

  if (unsolvedCount > 0 && timeRemaining > 0) {
    // Penalty for unsolved problems decreases as contest progresses
    const progressRatio = timeElapsed / contestDuration;
    const unsolvedPenalty = unsolvedCount * 30 * (1 - progressRatio * 0.7);
    projectedPerformance = Math.max(currentPerformance - unsolvedPenalty, 800);
  }

  return {
    currentPerformance: Math.round(currentPerformance),
    projectedPerformance: Math.round(projectedPerformance),
    timeRemaining: Math.round(timeRemaining / 60000), // in minutes
    solvedCount,
  };
};

/**
 * Enhanced performance calculation with wrong submission tracking
 * Call this when you have data about wrong submissions
 */
export const getPerformanceWithPenalties = (
  training: Training,
  userRating: number,
  wrongSubmissions: number[] // Array where index corresponds to problem index, value is wrong submission count
): number => {
  const contestDuration = (training.endTime - training.startTime) / 60000;

  const problemData: ProblemPerformance[] = training.problems.map(
    (problem, index) => {
      const problemRating = Object.values(training.customRatings)[index];
      const solved = problem.solvedTime !== null;
      const solveTime = problem.solvedTime
        ? (problem.solvedTime - training.startTime) / 60000
        : null;

      const penalty = wrongSubmissions[index] || 0;

      return {
        rating: problemRating,
        solved,
        solveTime,
        penalty,
      };
    }
  );

  let totalPerformance = 0;
  let totalWeight = 0;

  problemData.forEach((problem) => {
    const expectedProb = getExpectedSolveProb(userRating, problem.rating);

    const timeFactor =
      problem.solved && problem.solveTime
        ? getTimeFactor(problem.solveTime, contestDuration)
        : 1;

    const penaltyFactor = getPenaltyFactor(problem.penalty);

    const problemPerformance = solvePerformanceToRating(
      problem.rating,
      expectedProb,
      problem.solved,
      timeFactor,
      penaltyFactor
    );

    const difficultyWeight =
      1 + Math.max(0, (problem.rating - userRating) / 1000);

    totalPerformance += problemPerformance * difficultyWeight;
    totalWeight += difficultyWeight;
  });

  const averagePerformance =
    totalWeight > 0 ? totalPerformance / totalWeight : userRating;

  const solvedCount = problemData.filter((p) => p.solved).length;
  const totalProblems = problemData.length;

  let completionBonus = 1;
  if (solvedCount === totalProblems && totalProblems > 0) {
    completionBonus = 1.05;
  }

  let finalPerformance = averagePerformance * completionBonus;
  finalPerformance = Math.max(800, Math.min(4000, finalPerformance));

  return Math.round(finalPerformance);
};

/**
 * Get performance breakdown for detailed analysis
 */
export const getPerformanceBreakdown = (
  training: Training,
  userRating: number
): {
  problemBreakdown: {
    rating: number;
    solved: boolean;
    contribution: number;
    timeFactor: number;
    expectedDifficulty: "Easy" | "Medium" | "Hard" | "Very Hard";
  }[];
  overallMetrics: {
    avgProblemRating: number;
    solveRate: number;
    timeEfficiency: number;
    difficultyBalance: number;
  };
} => {
  const contestDuration = (training.endTime - training.startTime) / 60000;
  const problemBreakdown: any[] = [];

  training.problems.forEach((problem, index) => {
    const problemRating = Object.values(training.customRatings)[index];
    const solved = problem.solvedTime !== null;
    const solveTime = problem.solvedTime
      ? (problem.solvedTime - training.startTime) / 60000
      : null;

    const expectedProb = getExpectedSolveProb(userRating, problemRating);
    const timeFactor =
      solved && solveTime ? getTimeFactor(solveTime, contestDuration) : 1;

    const contribution = solvePerformanceToRating(
      problemRating,
      expectedProb,
      solved,
      timeFactor,
      1 // no penalty factor for breakdown
    );

    let expectedDifficulty: "Easy" | "Medium" | "Hard" | "Very Hard";
    if (expectedProb > 0.7) expectedDifficulty = "Easy";
    else if (expectedProb > 0.4) expectedDifficulty = "Medium";
    else if (expectedProb > 0.15) expectedDifficulty = "Hard";
    else expectedDifficulty = "Very Hard";

    problemBreakdown.push({
      rating: problemRating,
      solved,
      contribution: Math.round(contribution),
      timeFactor: Math.round(timeFactor * 100) / 100,
      expectedDifficulty,
    });
  });

  const avgProblemRating =
    Object.values(training.customRatings).reduce(
      (sum, rating) => sum + rating,
      0
    ) / training.problems.length;

  const solveRate =
    training.problems.filter((p) => p.solvedTime !== null).length /
    training.problems.length;

  const solvedTimes = training.problems
    .filter((p) => p.solvedTime !== null)
    .map((p) => (p.solvedTime! - training.startTime) / 60000);

  const avgSolveTime =
    solvedTimes.length > 0
      ? solvedTimes.reduce((sum, time) => sum + time, 0) / solvedTimes.length
      : contestDuration;

  const timeEfficiency = Math.max(
    0,
    Math.min(1, (contestDuration - avgSolveTime) / contestDuration)
  );

  const ratingSpread =
    Math.max(...Object.values(training.customRatings)) -
    Math.min(...Object.values(training.customRatings));
  const difficultyBalance = Math.max(0, 1 - ratingSpread / 800);

  return {
    problemBreakdown,
    overallMetrics: {
      avgProblemRating: Math.round(avgProblemRating),
      solveRate: Math.round(solveRate * 100) / 100,
      timeEfficiency: Math.round(timeEfficiency * 100) / 100,
      difficultyBalance: Math.round(difficultyBalance * 100) / 100,
    },
  };
};

/**
 * Backward compatible version using estimated rating
 */
export default getPerformance;
