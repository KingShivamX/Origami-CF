"use client";

import { useState, useEffect } from "react";
import { TrainingProblem } from "@/types/TrainingProblem";
import useCustomProblems from "@/hooks/useCustomProblems";
import Loader from "@/components/Loader";
import Error from "@/components/Error";
import CustomProblemsList from "@/components/CustomProblemsList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Eye, EyeOff } from "lucide-react";

export default function CustomProblemsPage() {
  const [problemInput, setProblemInput] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTags, setShowTags] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("origami-cf-showTags");
      return stored === "true";
    }
    return false;
  });

  const {
    customProblems,
    isLoading,
    error: hookError,
    addCustomProblem,
    deleteCustomProblem,
    onRefreshCustomProblems,
  } = useCustomProblems();

  useEffect(() => {
    localStorage.setItem("origami-cf-showTags", showTags.toString());
  }, [showTags]);

  if (isLoading) {
    return <Loader />;
  }

  if (hookError) {
    return <Error />;
  }

  const parseProblemFromInput = (
    input: string
  ): { contestId: number; index: string } | null => {
    const trimmedInput = input.trim();

    // Pattern 1: Contest URL - https://codeforces.com/contest/2161/problem/A
    const contestUrlMatch = trimmedInput.match(
      /https?:\/\/codeforces\.com\/contest\/(\d+)\/problem\/([A-Za-z]\d*)/
    );
    if (contestUrlMatch) {
      return {
        contestId: parseInt(contestUrlMatch[1]),
        index: contestUrlMatch[2].toUpperCase(),
      };
    }

    // Pattern 2: Problemset URL - https://codeforces.com/problemset/problem/2097/C
    const problemsetUrlMatch = trimmedInput.match(
      /https?:\/\/codeforces\.com\/problemset\/problem\/(\d+)\/([A-Za-z]\d*)/
    );
    if (problemsetUrlMatch) {
      return {
        contestId: parseInt(problemsetUrlMatch[1]),
        index: problemsetUrlMatch[2].toUpperCase(),
      };
    }

    // Pattern 3: Partial URL - 2161/problem/A
    const partialUrlMatch = trimmedInput.match(
      /^(\d+)\/problem\/([A-Za-z]\d*)$/
    );
    if (partialUrlMatch) {
      return {
        contestId: parseInt(partialUrlMatch[1]),
        index: partialUrlMatch[2].toUpperCase(),
      };
    }

    // Pattern 4: Short URL format - 2097/C
    const shortUrlMatch = trimmedInput.match(/^(\d+)\/([A-Za-z]\d*)$/);
    if (shortUrlMatch) {
      return {
        contestId: parseInt(shortUrlMatch[1]),
        index: shortUrlMatch[2].toUpperCase(),
      };
    }

    // Pattern 5: Short format - 2161A or 2161a
    const shortMatch = trimmedInput.match(/^(\d+)([A-Za-z]\d*)$/);
    if (shortMatch) {
      return {
        contestId: parseInt(shortMatch[1]),
        index: shortMatch[2].toUpperCase(),
      };
    }

    return null;
  };

  const handleAddProblem = async () => {
    if (!problemInput.trim()) return;

    setIsAdding(true);
    setError(null);

    try {
      const parsed = parseProblemFromInput(problemInput);

      if (!parsed) {
        setError(
          "Invalid problem format. Use formats like: 2161A, 2161/problem/A, or full URL"
        );
        setIsAdding(false);
        return;
      }

      const { contestId, index } = parsed;

      // Check if problem already exists
      const existingProblem = customProblems?.find(
        (p) => p.contestId === contestId && p.index === index
      );

      if (existingProblem) {
        setError("This problem is already in your list");
        setIsAdding(false);
        return;
      }

      // Fetch problem details from Codeforces API
      const response = await fetch(
        `https://codeforces.com/api/problemset.problems`
      );
      const data = await response.json();

      if (data.status !== "OK") {
        setError("Failed to fetch problem details from Codeforces");
        setIsAdding(false);
        return;
      }

      const problem = data.result.problems.find(
        (p: any) => p.contestId === contestId && p.index === index
      );

      if (!problem) {
        setError(
          "Problem not found. Please check the contest ID and problem index."
        );
        setIsAdding(false);
        return;
      }

      const newProblem: TrainingProblem = {
        contestId: problem.contestId,
        problemsetName: "", // Default empty string for custom problems
        index: problem.index,
        name: problem.name,
        type: "PROGRAMMING", // Default type for contest problems
        points: 0, // Default points for custom problems
        rating: problem.rating || 0,
        tags: problem.tags || [],
        url: `https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`,
        solvedTime: null,
      };

      await addCustomProblem(newProblem);
      setProblemInput("");
      setError(null);
    } catch (err) {
      setError("Failed to add problem. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const onDelete = (problem: TrainingProblem) => {
    if (confirm("Are you sure you want to delete this problem?")) {
      deleteCustomProblem(problem);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddProblem();
    }
  };

  return (
    <section className="container grid items-center gap-6 pb-6 pt-2 md:py-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold leading-tight tracking-tight">
            Saved Problems
          </h1>
          <p className="text-sm text-muted-foreground">
            Add problems by pasting their links or IDs to track your saved
            problems.
          </p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTags(!showTags)}
          >
            {showTags ? (
              <EyeOff className="h-4 w-4 mr-2" />
            ) : (
              <Eye className="h-4 w-4 mr-2" />
            )}
            {showTags ? "Hide Tags" : "Show Tags"}
          </Button>
          <Button variant="outline" onClick={onRefreshCustomProblems}>
            Refresh Status
          </Button>
        </div>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Add New Problem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Paste problem link (e.g., 2161A, 2097/C, or full URL)"
              value={problemInput}
              onChange={(e) => setProblemInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button
              onClick={handleAddProblem}
              disabled={isAdding || !problemInput.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              {isAdding ? "Adding..." : "Add"}
            </Button>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              <strong>Supported formats:</strong>
            </p>
            <p>
              • URLs: codeforces.com/contest/2161/problem/A or
              codeforces.com/problemset/problem/2097/C
            </p>
            <p>• Short: 2161A, 2161/problem/A, or 2097/C</p>
          </div>
        </CardContent>
      </Card>

      {customProblems && customProblems.length > 0 ? (
        <CustomProblemsList
          customProblems={customProblems}
          onDelete={onDelete}
          showTags={showTags}
        />
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          No custom problems added yet. Add some problems above to get started!
        </div>
      )}
    </section>
  );
}
