"use client";

import { TrainingProblem } from "@/types/TrainingProblem";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

const UpsolvedProblemsList = ({
  upsolvedProblems,
  onDelete,
}: {
  upsolvedProblems: TrainingProblem[];
  onDelete: (problem: TrainingProblem) => void;
}) => {
  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block w-full rounded-lg border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-0 w-full">Problem</TableHead>
                <TableHead className="w-24 flex-shrink-0">Rating</TableHead>
                <TableHead className="w-20 flex-shrink-0 text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upsolvedProblems.map((problem) => (
                <TableRow key={problem.contestId + problem.index}>
                  <TableCell className="min-w-0 max-w-0">
                    <Link
                      className="font-medium text-primary hover:underline block"
                      href={problem.url}
                      target="_blank"
                      title={problem.name}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="flex-shrink-0">
                          {problem.solvedTime ? "✅" : "❌"}
                        </span>
                        <span className="truncate">{problem.name}</span>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="flex-shrink-0">
                    {problem.rating}
                  </TableCell>
                  <TableCell className="text-right flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(problem)}
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
      </div>

      {/* Mobile & Tablet Card View */}
      <div className="lg:hidden space-y-3">
        {upsolvedProblems.map((problem) => (
          <Card
            key={problem.contestId + problem.index}
            className="border-2 border-border/50"
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <Link
                      className="font-medium text-primary hover:underline block"
                      href={problem.url}
                      target="_blank"
                      title={problem.name}
                    >
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="text-lg flex-shrink-0 mt-0.5">
                          {problem.solvedTime ? "✅" : "❌"}
                        </span>
                        <span className="break-words leading-tight">
                          {problem.name}
                        </span>
                      </div>
                    </Link>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(problem)}
                    className="flex-shrink-0 -mt-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                  <p className="text-sm text-muted-foreground">
                    Rating: {problem.rating}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

export default UpsolvedProblemsList;
