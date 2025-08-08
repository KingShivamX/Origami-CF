import Link from "next/link";
import { Training } from "@/types/Training";
import { TrainingProblem } from "@/types/TrainingProblem";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

const Problem = ({
  problem,
  startTime,
}: {
  problem: TrainingProblem;
  startTime: number;
}) => {
  const getSolvedStatus = () => {
    if (problem.solvedTime) {
      const solvedMinutes = Math.floor(
        (problem.solvedTime - startTime) / 60000
      );
      return `✅ ${solvedMinutes}m `;
    }
    return "❌ ";
  };
  return (
    <Link
      className="text-primary hover:underline duration-300 font-medium text-sm flex items-center gap-1"
      href={problem.url}
      target="_blank"
    >
      <span className="text-base">{getSolvedStatus()}</span>
      <span className="truncate">
        {problem.contestId}-{problem.index}
      </span>
    </Link>
  );
};

const History = ({
  history,
  deleteTraining,
  isDeleting,
}: {
  history: Training[];
  deleteTraining: (trainingId: string) => void;
  isDeleting: string | null;
}) => {
  const onDelete = (trainingId: string) => {
    if (confirm("Are you sure you want to delete this training session?")) {
      deleteTraining(trainingId);
    }
  };

  const calculateAverageRating = (training: Training) => {
    const ratings = Object.values(training.customRatings);
    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    return Math.round(sum / ratings.length);
  };

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No training history found.
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block w-full overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Avg Rating</TableHead>
              {history[0].problems.map((_, index) => (
                <TableHead key={index}>P{index + 1}</TableHead>
              ))}
              <TableHead>Performance</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((training) => (
              <TableRow key={training.startTime}>
                <TableCell>
                  {new Date(training.startTime).toLocaleDateString()}
                </TableCell>
                <TableCell>{calculateAverageRating(training)}</TableCell>
                {training.problems.map((p) => (
                  <TableCell key={p.contestId}>
                    <Problem problem={p} startTime={training.startTime} />
                  </TableCell>
                ))}
                <TableCell>{training.performance}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(training._id!)}
                    disabled={isDeleting === training._id}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile & Tablet Card View */}
      <div className="lg:hidden space-y-4">
        {history.map((training) => (
          <Card
            key={training.startTime}
            className="shadow-sm border-border/60 hover:shadow-md transition-shadow"
          >
            <CardContent className="p-5 sm:p-6">
              <div className="space-y-4">
                {/* Header with date and delete button */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                    {new Date(training.startTime).toLocaleDateString("en-US", {
                      month: "numeric",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(training._id!)}
                    disabled={isDeleting === training._id}
                    className="flex-shrink-0 h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Stats section */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">Avg Rating:</span>
                    <span className="text-sm font-semibold text-foreground">
                      {calculateAverageRating(training)}
                    </span>
                  </div>
                  <span className="hidden sm:inline text-muted-foreground/60">
                    •
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">Performance:</span>
                    <span className="text-sm font-semibold text-foreground">
                      {training.performance}
                    </span>
                  </div>
                </div>

                {/* Problems section */}
                <div className="pt-2 border-t border-border/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {training.problems.map((p, index) => (
                      <div
                        key={p.contestId}
                        className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <span className="text-sm font-semibold text-muted-foreground min-w-[2rem]">
                          P{index + 1}:
                        </span>
                        <div className="flex-1 min-w-0">
                          <Problem problem={p} startTime={training.startTime} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

export default History;
