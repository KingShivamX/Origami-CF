import { useMemo } from "react";
import { Training } from "@/types/Training";
import { TrainingProblem } from "@/types/TrainingProblem";

export interface HeatmapValue {
  date: string;
  count: number;
}

export interface HeatmapData {
  values: HeatmapValue[];
  totalSolved: number;
}

export const useHeatmapData = (
  history: Training[],
  upsolvedProblems: TrainingProblem[] = [],
  customProblems: TrainingProblem[] = []
): HeatmapData => {
  return useMemo(() => {
    const dailyCounts: { [key: string]: number } = {};
    let totalSolved = 0;
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Process training history problems
    if (history && history.length > 0) {
      history.forEach((training) => {
        training.problems.forEach((problem) => {
          if (problem.solvedTime) {
            totalSolved++;

            // Only add to heatmap if solved in the last year
            if (new Date(problem.solvedTime) >= oneYearAgo) {
              const date = new Date(problem.solvedTime)
                .toISOString()
                .split("T")[0];
              if (dailyCounts[date]) {
                dailyCounts[date]++;
              } else {
                dailyCounts[date] = 1;
              }
            }
          }
        });
      });
    }

    // Process upsolve problems
    if (upsolvedProblems && upsolvedProblems.length > 0) {
      upsolvedProblems.forEach((problem) => {
        if (problem.solvedTime) {
          totalSolved++;

          // Only add to heatmap if solved in the last year
          if (new Date(problem.solvedTime) >= oneYearAgo) {
            const date = new Date(problem.solvedTime)
              .toISOString()
              .split("T")[0];
            if (dailyCounts[date]) {
              dailyCounts[date]++;
            } else {
              dailyCounts[date] = 1;
            }
          }
        }
      });
    }

    // Process custom/saved problems
    if (customProblems && customProblems.length > 0) {
      customProblems.forEach((problem) => {
        if (problem.solvedTime) {
          totalSolved++;

          // Only add to heatmap if solved in the last year
          if (new Date(problem.solvedTime) >= oneYearAgo) {
            const date = new Date(problem.solvedTime)
              .toISOString()
              .split("T")[0];
            if (dailyCounts[date]) {
              dailyCounts[date]++;
            } else {
              dailyCounts[date] = 1;
            }
          }
        }
      });
    }

    const values = Object.keys(dailyCounts).map((date) => ({
      date,
      count: dailyCounts[date],
    }));

    return { values, totalSolved };
  }, [history, upsolvedProblems, customProblems]);
};
