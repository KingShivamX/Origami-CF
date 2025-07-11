import { Training } from "@/types/Training";

const getPerformance = (training: Training) => {
  // Extract problem ratings from custom ratings
  const ratings = [
    training.customRatings.P1,
    training.customRatings.P2,
    training.customRatings.P3,
    training.customRatings.P4,
  ];

  // Calculate solved times in minutes
  const solvedTimes = training.problems.map((p) =>
    p.solvedTime ? (p.solvedTime - training.startTime) / 60000 : null
  );

  // Calculate average rating
  const averageRating =
    ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;

  // Use contest time for threshold calculation
  const contestTime = (training.endTime - training.startTime) / 60000;
  const maxThreshold = contestTime;

  // Simplified performance calculation based on solved problems and timing
  let performance;

  // Count solved problems
  const solvedCount = solvedTimes.filter((time) => time !== null).length;

  if (solvedCount === 0) {
    // No problems solved - performance is below average
    performance = averageRating - 100;
  } else if (solvedCount === 4) {
    // All problems solved - calculate based on timing
    const validSolveTimes = solvedTimes.filter(
      (time): time is number => time !== null
    );
    const totalSolveTime = validSolveTimes.reduce((sum, time) => sum + time, 0);
    const avgSolveTime = totalSolveTime / validSolveTimes.length;

    // Performance scales with speed - faster solving = higher performance
    const speedFactor = Math.max(
      0.5,
      Math.min(1.5, maxThreshold / 2 / avgSolveTime)
    );
    performance = averageRating + (speedFactor - 1) * 100;
  } else {
    // Partial solve - performance between average and below average
    const solveRatio = solvedCount / 4;
    performance = averageRating - 50 + solveRatio * 100;
  }

  return Math.round(performance);
};

export default getPerformance;
