import Link from "next/link";
import { TrainingProblem } from "@/types/TrainingProblem";
import { Training } from "@/types/Training";
import CountDown from "@/components/CountDown";
import { ProblemTag } from "@/types/Codeforces";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Lock } from "lucide-react";

const ProblemRow = ({
  problem,
  index,
  isTraining,
  startTime,
  customRatings,
}: {
  problem: TrainingProblem;
  index: number;
  isTraining: boolean;
  startTime: number | null;
  customRatings: { P1: number; P2: number; P3: number; P4: number };
}) => {
  const now = Date.now();
  const isPreContestPeriod = isTraining && startTime && now < startTime;
  const problemLabels = ["A", "B", "C", "D"];
  const ratingKeys = ["P1", "P2", "P3", "P4"] as const;

  const getSolvedStatus = () => {
    if (!isTraining) return "";
    if (problem.solvedTime && startTime) {
      const solvedMinutes = Math.floor(
        (problem.solvedTime - startTime) / 60000
      );
      return `✅ ${solvedMinutes}m`;
    }
    return "⌛";
  };

  const problemRating = customRatings[ratingKeys[index]];

  const content = (
    <div
      className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
        isPreContestPeriod
          ? "bg-muted/20 cursor-not-allowed opacity-60"
          : "bg-muted/20 hover:bg-muted/40 cursor-pointer"
      }`}
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg min-w-[24px]">
            {problemLabels[index]}
          </span>
          {isPreContestPeriod && (
            <Lock className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-primary">{problem.name}</div>
          <div className="text-sm text-muted-foreground">
            {problem.contestId}-{problem.index}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {!isTraining && (
          <span className="text-sm font-medium">{problemRating}</span>
        )}
        {isTraining && (
          <span className="text-lg font-medium min-w-[80px] text-right">
            {getSolvedStatus()}
          </span>
        )}
      </div>
    </div>
  );

  if (isPreContestPeriod) {
    return content;
  }

  return (
    <Link href={problem.url} target="_blank" className="block">
      {content}
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

  const currentProblems =
    isTraining && training?.problems ? training.problems : problems;

  return (
    <Card className="border-2 border-border/50 shadow-lg">
      <CardContent className="pt-8 space-y-8">
        {/* Problems Section */}
        {currentProblems && currentProblems.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">Problems</h3>
            <div className="space-y-2">
              {currentProblems.map((problem, index) => (
                <ProblemRow
                  key={`${problem.contestId}-${problem.index}-${index}`}
                  problem={problem}
                  index={index}
                  isTraining={isTraining}
                  startTime={training?.startTime ?? null}
                  customRatings={customRatings}
                />
              ))}
            </div>
          </div>
        )}

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
