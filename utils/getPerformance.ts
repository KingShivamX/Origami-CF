import { Training } from "@/types/Training";

interface ProblemPerformance {
  rating: number;
  solved: boolean;
  solveTime: number | null; // in minutes
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
 * Calculate time factor - much more conservative than before
 * Real Codeforces gives minimal time bonuses
 */
const getTimeFactor = (solveTime: number, contestDuration: number): number => {
  if (solveTime <= 0) return 1;

  const timeRatio = solveTime / contestDuration;

  // Very early solve (0-10%): tiny 3% bonus
  if (timeRatio <= 0.1) return 1.03;

  // Early solve (10-40%): tiny 1% bonus
  if (timeRatio <= 0.4) return 1.01;

  // Normal solve (40-80%): no bonus/penalty
  if (timeRatio <= 0.8) return 1.0;

  // Late solve (80-100%): small 3% penalty
  return 0.97;
};

/**
 * Convert solve performance to rating points
 * Much more conservative than before
 */
const solvePerformanceToRating = (
  problemRating: number,
  expectedProb: number,
  actualSolved: boolean,
  timeFactor: number
): number => {
  let basePerformance;

  if (actualSolved) {
    // Solved: Performance boost based on difficulty
    // Much smaller bonuses - max 100 points instead of 200
    const difficultyBonus = Math.max(0, (1 - expectedProb) * 100);
    basePerformance = problemRating + difficultyBonus;
  } else {
    // Not solved: Performance penalty based on expected difficulty
    // Smaller penalties too
    const difficultyPenalty = expectedProb * 100;
    basePerformance = problemRating - difficultyPenalty;
  }

  // Apply much smaller time factors
  return basePerformance * timeFactor;
};

/**
 * Main performance calculation function
 * Completely rewritten to be more accurate to real Codeforces
 */
const getPerformance = (
  training: Training,
  userRating: number = 1500
): number => {
  const contestDuration = (training.endTime - training.startTime) / 60000; // in minutes

  // Extract problem data - no more penalty tracking
  const problemData: ProblemPerformance[] = training.problems.map(
    (problem, index) => {
      const problemRating = Object.values(training.customRatings)[index];
      const solved = problem.solvedTime !== null;
      const solveTime = problem.solvedTime
        ? (problem.solvedTime - training.startTime) / 60000
        : null;

      return {
        rating: problemRating,
        solved,
        solveTime,
      };
    }
  );

  let totalPerformance = 0;
  let problemCount = 0;

  // Calculate performance for each problem
  problemData.forEach((problem) => {
    const expectedProb = getExpectedSolveProb(userRating, problem.rating);

    const timeFactor =
      problem.solved && problem.solveTime
        ? getTimeFactor(problem.solveTime, contestDuration)
        : 1;

    const problemPerformance = solvePerformanceToRating(
      problem.rating,
      expectedProb,
      problem.solved,
      timeFactor
    );

    // Simple average - no complex weighting that inflates ratings
    totalPerformance += problemPerformance;
    problemCount++;
  });

  // Simple average performance
  const averagePerformance =
    problemCount > 0 ? totalPerformance / problemCount : userRating;

  // Apply penalty for unsolved problems - this is key for realism
  const solvedCount = problemData.filter((p) => p.solved).length;
  const totalProblems = problemData.length;
  const solveRatio = solvedCount / totalProblems;

  // Heavy penalty for not solving problems - this brings ratings down significantly
  let finalPerformance = averagePerformance;

  if (solveRatio < 1.0) {
    // Each unsolved problem reduces performance
    const unsolvedPenalty = (1 - solveRatio) * 150; // 150 points per unsolved problem on average
    finalPerformance = averagePerformance - unsolvedPenalty;
  }

  // Ensure performance is within reasonable bounds
  finalPerformance = Math.max(600, Math.min(3500, finalPerformance));

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

  // Calculate current performance based on solved problems so far
  const currentPerformance = getPerformance(training, userRating);

  // Project performance assuming no more problems are solved
  const solvedCount = training.problems.filter(
    (p) => p.solvedTime !== null
  ).length;
  const unsolvedCount = training.problems.length - solvedCount;

  // Projected performance assumes you don't solve any more
  let projectedPerformance = currentPerformance;

  if (unsolvedCount > 0) {
    // Additional penalty for remaining unsolved problems
    const additionalPenalty = unsolvedCount * 50;
    projectedPerformance = Math.max(
      currentPerformance - additionalPenalty,
      600
    );
  }

  return {
    currentPerformance: Math.round(currentPerformance),
    projectedPerformance: Math.round(projectedPerformance),
    timeRemaining: Math.round(timeRemaining / 60000), // in minutes
    solvedCount,
  };
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
      timeFactor
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
