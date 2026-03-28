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
import { Plus, Eye, EyeOff, RefreshCw, CheckCircle } from "lucide-react";

import { motion } from "framer-motion";

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
        "https://codeforces.com/api/problemset.problems"
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
    } catch (_err) {
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddProblem();
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.section
      className="container flex flex-col gap-10 pb-20 pt-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className="flex flex-col md:flex-row md:items-start md:justify-between gap-6"
        variants={itemVariants}
      >
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
            Saved <span className="text-accentPrimary">Vault</span>
          </h1>
          <p className="text-lg text-textSecondary font-medium max-w-2xl">
            Curate your algorithmic arsenal. Store and track specific challenges that demand further investigation or mastery.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 self-start md:self-auto">
          <Button
            variant="outline"
            size="lg"
            className="h-12 rounded-xl font-bold border-white/10 hover:bg-white/5 transition-all"
            onClick={() => setShowTags(!showTags)}
          >
            {showTags ? (
              <EyeOff className="h-5 w-5 mr-2" />
            ) : (
              <Eye className="h-5 w-5 mr-2" />
            )}
            {showTags ? "Hide Tags" : "Show Tags"}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 rounded-xl font-bold border-accentPrimary/50 text-accentPrimary hover:bg-accentPrimary hover:text-white transition-all duration-300 shadow-lg shadow-accentPrimary/10"
            onClick={() => onRefreshCustomProblems()}
          >
            Refresh Status
          </Button>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="w-full"
      >
        <Card className="border-white/5 bg-white/5 backdrop-blur-md shadow-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Import Challenge</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Paste problem link (e.g., 2161A, 2097/C, or full URL)"
                value={problemInput}
                onChange={(e) => setProblemInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 h-14 text-lg bg-white/5 border-white/10 rounded-xl focus:ring-accentPrimary/50"
              />
              <Button
                size="lg"
                onClick={handleAddProblem}
                disabled={isAdding || !problemInput.trim()}
                className="h-14 px-10 font-bold text-white bg-accentPrimary hover:bg-accentHover rounded-xl shadow-xl shadow-accentPrimary/20 transition-all active:scale-95"
              >
                {isAdding ? (
                  <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Plus className="h-5 w-5 mr-2" />
                )}
                {isAdding ? "Processing..." : "Add to Vault"}
              </Button>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm font-semibold text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20"
              >
                {error}
              </motion.p>
            )}

            <div className="text-sm text-textSecondary space-y-2 bg-black/20 p-5 rounded-2xl border border-white/5">
              <p className="font-bold text-white/90 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-accentPrimary" />
                Input Protocol:
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 opacity-80">
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-accentPrimary" />
                  Full Codeforces URLs
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-accentPrimary" />
                  Short notation (e.g., 2161A)
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-accentPrimary" />
                  Contest IDs (e.g., 2097/C)
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-accentPrimary" />
                  Direct index (e.g., 2161/problem/A)
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="w-full"
      >
        {customProblems && customProblems.length > 0 ? (
          <CustomProblemsList
            customProblems={customProblems}
            onDelete={onDelete}
            showTags={showTags}
          />
        ) : (
          <div className="text-center py-16 text-textSecondary font-medium">
            No custom problems added yet. Add some problems above to get started!
          </div>
        )}
      </motion.div>
    </motion.section>
  );
}
