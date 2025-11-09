/* eslint-disable indent */
import Link from "next/link";
import { Training } from "@/types/Training";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

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
    if (confirm("Are you sure you want to delete this contest?")) {
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
        No contest history found.
      </div>
    );
  }

  return (
    <>
      {/* Desktop Compact View */}
      <div className="hidden lg:block space-y-3">
        {history.map((training) => (
          <div
            key={training.startTime}
            className="flex items-center gap-4 p-4 rounded-lg border border-border/50 bg-card hover:bg-muted/30 transition-colors"
          >
            {/* Date */}
            <div className="flex-shrink-0 w-24">
              <span className="text-sm font-medium text-foreground">
                {new Date(training.startTime).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground w-20">
              <span>
                Avg:{" "}
                <span className="text-foreground font-medium">
                  {calculateAverageRating(training)}
                </span>
              </span>
            </div>

            {/* Problems - standardized grid layout */}
            <div className="grid grid-cols-4 gap-3 flex-1">
              {training.problems.map((p, index) => {
                const ratingKey =
                  `P${index + 1}` as keyof typeof training.customRatings;
                const problemRating = training.customRatings[ratingKey];
                return (
                  <div
                    key={p.contestId}
                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-md transition-colors border border-border/30 min-h-[40px] text-sm font-medium ${
                      p.solvedTime
                        ? "bg-green-500/10 hover:bg-green-500/20 text-green-700"
                        : "bg-red-500/10 hover:bg-red-500/20 text-red-700"
                    }`}
                  >
                    {/* Left side - Problem ID with solve time */}
                    <div className="flex items-center gap-1">
                      {p.solvedTime && (
                        <>
                          <span className="font-bold text-sm">
                            {Math.floor(
                              (p.solvedTime - training.startTime) / 60000
                            )}
                            m
                          </span>
                          <span className="text-muted-foreground">|</span>
                        </>
                      )}
                      <Link
                        className="hover:underline font-semibold text-sm"
                        href={p.url}
                        target="_blank"
                      >
                        {p.contestId}-{p.index}
                      </Link>
                    </div>

                    {/* Right side - Rating */}
                    {problemRating && (
                      <span
                        className={`font-bold px-1.5 py-0.5 rounded text-white text-sm flex-shrink-0 ${
                          problemRating < 1200
                            ? "bg-gray-500"
                            : problemRating < 1400
                              ? "bg-green-500"
                              : problemRating < 1600
                                ? "bg-cyan-500"
                                : problemRating < 1900
                                  ? "bg-blue-500"
                                  : problemRating < 2100
                                    ? "bg-violet-500"
                                    : problemRating < 2300
                                      ? "bg-orange-500"
                                      : "bg-red-500"
                        }`}
                      >
                        {problemRating}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Delete button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(training._id!)}
              disabled={isDeleting === training._id}
              className="flex-shrink-0 h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      {/* Mobile & Tablet Compact View */}
      <div className="lg:hidden space-y-3">
        {history.map((training) => (
          <div
            key={training.startTime}
            className="flex flex-col gap-3 p-3 sm:p-4 rounded-lg border border-border/50 bg-card hover:bg-muted/30 transition-colors"
          >
            {/* Header Row */}
            <div className="flex items-center justify-between">
              {/* Date and Stats on same line */}
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="text-sm font-medium text-foreground">
                  {new Date(training.startTime).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="text-xs text-muted-foreground">
                  Avg:{" "}
                  <span className="text-foreground font-medium">
                    {calculateAverageRating(training)}
                  </span>
                </span>
              </div>

              {/* Delete button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(training._id!)}
                disabled={isDeleting === training._id}
                className="flex-shrink-0 h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>

            {/* Problems Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {training.problems.map((p, index) => {
                const ratingKey =
                  `P${index + 1}` as keyof typeof training.customRatings;
                const problemRating = training.customRatings[ratingKey];
                return (
                  <div
                    key={p.contestId}
                    className={`flex items-center justify-between gap-2 px-2 sm:px-3 py-2 rounded-md transition-colors border border-border/30 min-h-[36px] sm:min-h-[40px] text-sm font-medium ${
                      p.solvedTime
                        ? "bg-green-500/10 hover:bg-green-500/20 text-green-700"
                        : "bg-red-500/10 hover:bg-red-500/20 text-red-700"
                    }`}
                  >
                    {/* Left side - Problem ID with solve time */}
                    <div className="flex items-center gap-1">
                      {p.solvedTime && (
                        <>
                          <span className="font-bold text-sm">
                            {Math.floor(
                              (p.solvedTime - training.startTime) / 60000
                            )}
                            m
                          </span>
                          <span className="text-muted-foreground">|</span>
                        </>
                      )}
                      <Link
                        className="hover:underline font-semibold text-sm"
                        href={p.url}
                        target="_blank"
                      >
                        {p.contestId}-{p.index}
                      </Link>
                    </div>

                    {/* Right side - Rating */}
                    {problemRating && (
                      <span
                        className={`font-bold px-1.5 py-0.5 rounded text-white text-sm flex-shrink-0 ${
                          problemRating < 1200
                            ? "bg-gray-500"
                            : problemRating < 1400
                              ? "bg-green-500"
                              : problemRating < 1600
                                ? "bg-cyan-500"
                                : problemRating < 1900
                                  ? "bg-blue-500"
                                  : problemRating < 2100
                                    ? "bg-violet-500"
                                    : problemRating < 2300
                                      ? "bg-orange-500"
                                      : "bg-red-500"
                        }`}
                      >
                        {problemRating}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default History;
