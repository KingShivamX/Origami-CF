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

const UpsolvedProblemsList = ({
  upsolvedProblems,
  onDelete,
}: {
  upsolvedProblems: TrainingProblem[];
  onDelete: (problem: TrainingProblem) => void;
}) => {
  return (
    <div className="w-full overflow-x-auto rounded-lg border">
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
  );
};

export default UpsolvedProblemsList;
