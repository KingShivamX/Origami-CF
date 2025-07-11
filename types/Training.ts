import { TrainingProblem } from "./TrainingProblem";

export interface Training {
  _id?: string;
  startTime: number;
  endTime: number;
  customRatings: {
    P1: number;
    P2: number;
    P3: number;
    P4: number;
  };
  problems: TrainingProblem[];
  performance: number;
}
