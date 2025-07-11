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
      <div className="hidden md:block w-full overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Problem</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {upsolvedProblems.map((problem) => (
              <TableRow key={problem.contestId + problem.index}>
                <TableCell>
                  <Link
                    className="font-medium text-primary hover:underline"
                    href={problem.url}
                    target="_blank"
                  >
                    {problem.solvedTime ? "✅ " : "❌ "} {problem.name}
                  </Link>
                </TableCell>
                <TableCell>{problem.rating}</TableCell>
                <TableCell className="text-right">
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

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {upsolvedProblems.map((problem) => (
          <Card
            key={problem.contestId + problem.index}
            className="border-2 border-border/50"
          >
            <CardContent className="pt-4">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <Link
                    className="font-medium text-primary hover:underline block"
                    href={problem.url}
                    target="_blank"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {problem.solvedTime ? "✅" : "❌"}
                      </span>
                      <span className="truncate">{problem.name}</span>
                    </div>
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">
                    Rating: {problem.rating}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(problem)}
                  className="flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

export default UpsolvedProblemsList;
