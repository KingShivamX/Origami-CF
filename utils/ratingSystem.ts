import { Training } from "@/types/Training";

/**
 * Origami-CF Rating System
 * Based on mathematical formula for competitive programming rating changes
 * 
 * Formula:
 * P = Σ(W_i / (1 + T_i/T_max)) for solved problems
 * P_norm = P / Σ(W_i) for all problems
 * ΔR = k × (P_norm - E)
 * R_new = R_old + ΔR
 */

export interface RatingChange {
  oldRating: number;
  newRating: number;
  ratingDelta: number;
  performance: number;
  normalizedPerformance: number;
  solvedCount: number;
  totalProblems: number;
  timeEfficiency: number;
}

/**
 * Configuration constants for the rating system
 */
const RATING_CONFIG = {
  k: 100, // Sensitivity constant (how fast rating moves)
  E: 0.5, // Expected performance threshold (0.5 = average)
  maxDelta: 200, // Maximum rating change per contest
  minRating: 600, // Minimum possible rating
  maxRating: 3500, // Maximum possible rating
};

/**
 * Get problem weight based on its difficulty rating
 * Higher rated problems get more weight
 */
const getProblemWeight = (problemRating: number): number => {
  // Weight based on problem difficulty tier
  if (problemRating < 1200) return 1;
  if (problemRating < 1400) return 1.5;
  if (problemRating < 1600) return 2;
  if (problemRating < 1900) return 3;
  if (problemRating < 2100) return 4;
  if (problemRating < 2300) return 5;
  return 6; // 2300+
};

/**
 * Calculate time factor for solved problems
 * Solving faster gives better score
 */
const getTimeFactor = (solveTime: number, contestDuration: number): number => {
  if (solveTime <= 0 || contestDuration <= 0) return 0;
  return 1 / (1 + solveTime / contestDuration);
};

/**
 * Apply soft cap to prevent massive rating jumps
 * Uses tanh function for smooth limiting
 */
const applySoftCap = (delta: number, maxDelta: number): number => {
  if (Math.abs(delta) <= maxDelta) return delta;
  const sign = delta >= 0 ? 1 : -1;
  return sign * maxDelta * Math.tanh(Math.abs(delta) / maxDelta);
};

/**
 * Main rating calculation function
 * Implements the mathematical formula provided by user
 */
export const calculateRatingChange = (
  training: Training,
  currentRating: number
): RatingChange => {
  const contestDuration = (training.endTime - training.startTime) / 60000; // in minutes
  
  // Step 1: Calculate Performance Score (P)
  let performanceScore = 0;
  let totalWeight = 0;
  let solvedCount = 0;
  
  training.problems.forEach((problem, index) => {
    const problemRating = Object.values(training.customRatings)[index];
    const weight = getProblemWeight(problemRating);
    const solved = problem.solvedTime !== null;
    
    // Add to total weight (for normalization)
    totalWeight += weight;
    
    if (solved) {
      solvedCount++;
      const solveTime = (problem.solvedTime! - training.startTime) / 60000;
      const timeFactor = getTimeFactor(solveTime, contestDuration);
      
      // P = Σ(W_i / (1 + T_i/T_max)) for solved problems
      // But we use time factor for better scaling
      performanceScore += weight * timeFactor;
    }
    // Unsolved problems contribute 0 to performance score
  });
  
  // Step 2: Normalize Performance (P_norm)
  const normalizedPerformance = totalWeight > 0 ? performanceScore / totalWeight : 0;
  
  // Step 3: Calculate Rating Change (ΔR)
  const rawDelta = RATING_CONFIG.k * (normalizedPerformance - RATING_CONFIG.E);
  
  // Apply soft cap to prevent extreme changes
  const cappedDelta = applySoftCap(rawDelta, RATING_CONFIG.maxDelta);
  
  // Step 4: Calculate New Rating (R_new)
  const newRating = Math.max(
    RATING_CONFIG.minRating,
    Math.min(RATING_CONFIG.maxRating, currentRating + cappedDelta)
  );
  
  // Calculate time efficiency for additional metrics
  const solvedTimes = training.problems
    .filter(p => p.solvedTime !== null)
    .map(p => (p.solvedTime! - training.startTime) / 60000);
  
  const avgSolveTime = solvedTimes.length > 0 
    ? solvedTimes.reduce((sum, time) => sum + time, 0) / solvedTimes.length 
    : contestDuration;
  
  const timeEfficiency = Math.max(0, Math.min(1, (contestDuration - avgSolveTime) / contestDuration));
  
  return {
    oldRating: currentRating,
    newRating: Math.round(newRating),
    ratingDelta: Math.round(newRating - currentRating),
    performance: Math.round(performanceScore * 100), // Scale for display
    normalizedPerformance: Math.round(normalizedPerformance * 1000) / 1000,
    solvedCount,
    totalProblems: training.problems.length,
    timeEfficiency: Math.round(timeEfficiency * 100) / 100,
  };
};

/**
 * Get rating tier/rank based on rating value
 * Similar to Codeforces ranking system
 */
export const getRatingTier = (rating: number): { 
  tier: string; 
  color: string; 
  range: string 
} => {
  if (rating < 1200) return { 
    tier: "Newbie", 
    color: "text-gray-600", 
    range: "< 1200" 
  };
  if (rating < 1400) return { 
    tier: "Pupil", 
    color: "text-green-600", 
    range: "1200-1399" 
  };
  if (rating < 1600) return { 
    tier: "Specialist", 
    color: "text-cyan-600", 
    range: "1400-1599" 
  };
  if (rating < 1900) return { 
    tier: "Expert", 
    color: "text-blue-600", 
    range: "1600-1899" 
  };
  if (rating < 2100) return { 
    tier: "Candidate Master", 
    color: "text-violet-600", 
    range: "1900-2099" 
  };
  if (rating < 2300) return { 
    tier: "Master", 
    color: "text-orange-600", 
    range: "2100-2299" 
  };
  if (rating < 2400) return { 
    tier: "International Master", 
    color: "text-red-600", 
    range: "2300-2399" 
  };
  return { 
    tier: "Grandmaster", 
    color: "text-red-700", 
    range: "2400+" 
  };
};

/**
 * Format rating change for display
 * Shows + for positive, - for negative changes
 */
export const formatRatingChange = (delta: number): string => {
  if (delta === 0) return "±0";
  return delta > 0 ? `+${delta}` : `${delta}`;
};

/**
 * Get performance summary for contest analysis
 */
export const getPerformanceSummary = (ratingChange: RatingChange): {
  grade: "Excellent" | "Good" | "Average" | "Poor" | "Very Poor";
  description: string;
  suggestions: string[];
} => {
  const { normalizedPerformance, solvedCount, totalProblems, timeEfficiency, ratingDelta } = ratingChange;
  const solveRate = solvedCount / totalProblems;
  
  let grade: "Excellent" | "Good" | "Average" | "Poor" | "Very Poor";
  let description: string;
  let suggestions: string[] = [];
  
  if (normalizedPerformance >= 0.8 && solveRate >= 0.75) {
    grade = "Excellent";
    description = "Outstanding performance! You solved most problems efficiently.";
    suggestions.push("Try harder problem sets to continue improving");
    suggestions.push("Consider participating in real contests");
  } else if (normalizedPerformance >= 0.6 && solveRate >= 0.5) {
    grade = "Good";
    description = "Good performance with solid problem-solving skills.";
    suggestions.push("Focus on solving problems faster");
    suggestions.push("Practice more complex algorithms");
  } else if (normalizedPerformance >= 0.4 && solveRate >= 0.25) {
    grade = "Average";
    description = "Average performance with room for improvement.";
    suggestions.push("Practice basic algorithms and data structures");
    suggestions.push("Work on time management during contests");
  } else if (solveRate > 0) {
    grade = "Poor";
    description = "Below average performance. Keep practicing!";
    suggestions.push("Focus on easier problems first");
    suggestions.push("Review fundamental programming concepts");
    suggestions.push("Practice implementation skills");
  } else {
    grade = "Very Poor";
    description = "No problems solved. Don't give up!";
    suggestions.push("Start with much easier problems");
    suggestions.push("Review basic programming syntax");
    suggestions.push("Practice problem understanding and logic");
  }
  
  // Add time-specific suggestions
  if (timeEfficiency < 0.3 && solveRate > 0) {
    suggestions.push("Focus on solving problems faster");
  }
  
  return { grade, description, suggestions };
};
