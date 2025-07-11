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
      className="text-primary hover:underline duration-300"
      href={problem.url}
      target="_blank"
    >
      {getSolvedStatus()}
      {problem.contestId}-{problem.index}
    </Link>
  );
};

const History = ({
  history,
  deleteTraining,
}: {
  history: Training[];
  deleteTraining: (training: Training) => void;
}) => {
  const onDelete = (training: Training) => {
    if (confirm("Are you sure you want to delete this training session?")) {
      deleteTraining(training);
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
      <div className="hidden lg:block w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Avg Rating</TableHead>
              {history[0].problems.map((_, index) => (
                <TableHead key={index}>P{index + 1}</TableHead>
              ))}
              <TableHead>Performance</TableHead>
              <TableHead></TableHead>
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
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(training)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {history.map((training) => (
          <Card key={training.startTime} className="border-2 border-border/50">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {new Date(training.startTime).toLocaleDateString()}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Avg Rating: {calculateAverageRating(training)} •
                    Performance: {training.performance}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(training)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {training.problems.map((p, index) => (
                  <div key={p.contestId} className="text-sm">
                    <span className="font-medium">P{index + 1}: </span>
                    <Problem problem={p} startTime={training.startTime} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

export default History;
