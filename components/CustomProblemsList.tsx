import Link from "next/link";
import { TrainingProblem } from "@/types/TrainingProblem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, CheckCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomProblemsListProps {
  customProblems: TrainingProblem[];
  onDelete: (problem: TrainingProblem) => void;
  showTags: boolean;
}

const CustomProblemsList = ({
  customProblems,
  onDelete,
  showTags,
}: CustomProblemsListProps) => {
  // Keep problems in the order they were added (no sorting)
  // This maintains the insertion order from the database
  const allSortedProblems = customProblems;

  const getRatingColor = (rating: number | undefined) => {
    if (!rating) return "bg-gray-500";
    if (rating < 1200) return "bg-gray-500";
    if (rating < 1400) return "bg-green-500";
    if (rating < 1600) return "bg-cyan-500";
    if (rating < 1900) return "bg-blue-500";
    if (rating < 2100) return "bg-violet-500";
    if (rating < 2300) return "bg-orange-500";
    if (rating < 2400) return "bg-red-500";
    return "bg-red-600";
  };

  if (customProblems.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">
          Your Custom Problems ({customProblems.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {allSortedProblems.map((problem, index) => (
            <div
              key={`${problem.contestId}-${problem.index}`}
              className={cn(
                "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border transition-all",
                problem.solvedTime
                  ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                  : "bg-card border-border hover:bg-muted/50"
              )}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 mt-1">
                  {problem.solvedTime ? (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-start gap-2">
                    <Link
                      href={problem.url}
                      target="_blank"
                      className="font-semibold text-primary hover:underline break-words"
                    >
                      {problem.contestId}{problem.index}. {problem.name}
                    </Link>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    {problem.rating && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-white text-xs font-medium",
                          getRatingColor(problem.rating)
                        )}
                      >
                        {problem.rating}
                      </Badge>
                    )}
                    
                    {showTags && problem.tags && problem.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {problem.tags.map((tag, tagIndex) => (
                          <Badge
                            key={tagIndex}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {problem.solvedTime && (
                    <div className="text-xs text-muted-foreground">
                      Solved: {new Date(problem.solvedTime).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 self-start sm:self-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(problem)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {customProblems.length > 0 && (
          <div className="mt-6 pt-4 border-t text-sm text-muted-foreground text-center">
            {customProblems.filter(p => !p.solvedTime).length} unsolved • {customProblems.filter(p => p.solvedTime).length} solved
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomProblemsList;
