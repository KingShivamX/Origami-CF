import { TrainingProblem } from "@/types/TrainingProblem";

type Training = {
  customRatings: {
    P1: number;
    P2: number;
    P3: number;
    P4: number;
  };
  contestTime: number;
  startTime: number;
  endTime: number;
  problems: TrainingProblem[];
  performance: number;
};

export type { Training };
