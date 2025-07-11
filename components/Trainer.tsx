import Link from "next/link";
import { TrainingProblem } from "@/types/TrainingProblem";
import { Training } from "@/types/Training";
import CountDown from "@/components/CountDown";
import { ProblemTag } from "@/types/Codeforces";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";

const ProblemLink = ({
  problem,
  isTraining,
  startTime,
}: {
  problem: TrainingProblem;
  isTraining: boolean;
  startTime: number | null;
}) => {
  const getSolvedStatus = () => {
    if (!isTraining) return "";
    if (problem.solvedTime && startTime) {
      const solvedMinutes = Math.floor(
        (problem.solvedTime - startTime) / 60000
      );
      return `✅ ${solvedMinutes}m `;
    }
    return "⌛ ";
  };

  return (
    <Link
      className="text-primary hover:underline inline-block min-w-[120px] text-center p-2 rounded-lg border border-border/30 bg-muted/20 hover:bg-muted/40 transition-colors"
      href={problem.url}
      target="_blank"
    >
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm opacity-75">{getSolvedStatus()}</span>
        <span className="font-semibold">
          {problem.contestId}-{problem.index}
        </span>
      </div>
    </Link>
  );
};

const Trainer = ({
  isTraining,
  training,
  problems,
  generateProblems,
  startTraining,
  stopTraining,
  refreshProblemStatus,
  finishTraining,
  selectedTags,
  lb,
  ub,
  customRatings,
}: {
  isTraining: boolean;
  training: Training | null;
  problems: TrainingProblem[] | null;
  generateProblems: (
    tags: ProblemTag[],
    lb: number,
    ub: number,
    customRatings: { P1: number; P2: number; P3: number; P4: number }
  ) => void;
  startTraining: (customRatings: {
    P1: number;
    P2: number;
    P3: number;
    P4: number;
  }) => void;
  stopTraining: () => void;
  refreshProblemStatus: () => void;
  finishTraining: () => void;
  selectedTags: ProblemTag[];
  lb: number;
  ub: number;
  customRatings: { P1: number; P2: number; P3: number; P4: number };
}) => {
  const onFinishTraining = () => {
    if (confirm("Are you sure to finish the training?")) {
      finishTraining();
    }
  };

  const onStopTraining = () => {
    if (confirm("Are you sure to stop the training?")) {
      stopTraining();
    }
  };

  return (
    <Card className="border-2 border-border/50 shadow-lg">
      <CardContent className="pt-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xl font-semibold">
          {(isTraining && training?.problems
            ? training.problems
            : problems
          )?.map((problem, index) => (
            <ProblemLink
              key={`${problem.contestId}-${problem.index}-${index}`}
              problem={problem}
              isTraining={isTraining}
              startTime={training?.startTime ?? null}
            />
          ))}
        </div>

        <div className="flex flex-col items-center gap-4">
          {!isTraining ? (
            <div className="flex justify-center gap-4">
              <Button
                onClick={() =>
                  generateProblems(selectedTags, lb, ub, customRatings)
                }
              >
                {problems && problems.length > 0
                  ? "Regenerate"
                  : "Generate Problems"}
              </Button>
              {problems && problems.length > 0 && (
                <Button onClick={() => startTraining(customRatings)}>
                  Start
                </Button>
              )}
            </div>
          ) : (
            training && (
              <>
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between w-full py-6 gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={refreshProblemStatus}
                    className="text-lg font-semibold px-6 py-3 lg:order-1"
                  >
                    <RefreshCw className="h-5 w-5 mr-3" />
                    Refresh
                  </Button>
                  <div className="text-center lg:order-2">
                    <CountDown
                      startTime={training.startTime}
                      endTime={training.endTime}
                    />
                  </div>
                  <div className="flex gap-3 justify-center lg:justify-end lg:order-3">
                    <Button 
                      onClick={onFinishTraining} 
                      size="lg"
                      className="text-lg font-semibold px-6 py-3 flex-1 sm:flex-none"
                    >
                      Finish
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={onStopTraining}
                      size="lg"
                      className="text-lg font-semibold px-6 py-3 flex-1 sm:flex-none"
                    >
                      Stop
                    </Button>
                  </div>
                </div>
              </>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Trainer;
