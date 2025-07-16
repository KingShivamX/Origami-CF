"use client";

import { Plus, Minus } from "lucide-react";
import useTraining from "@/hooks/useTraining";
import Trainer from "@/components/Trainer";
import useBounds from "@/hooks/useBounds";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textboxpair } from "@/components/ui/textboxpair";
import { useState } from "react";
import TagSelector from "@/components/TagSelector";
import useTags from "@/hooks/useTags";
import useUser from "@/hooks/useUser";
import Loader from "@/components/Loader";
import Error from "@/components/Error";

export default function TrainingPage() {
  const { user } = useUser();
  const { allTags, selectedTags, onTagClick, onClearTags } = useTags();
  const {
    startTraining,
    stopTraining,
    problems,
    training,
    isTraining,
    isLoading,
    refreshProblemStatus,
    finishTraining,
    generateProblems,
  } = useTraining();
  const { firstInput, secondInput, onFirstInputChange, onSecondInputChange } =
    useBounds();

  const [customRatings, setCustomRatings] = useState({
    P1: 800,
    P2: 900,
    P3: 1000,
    P4: 1100,
  });

  const isValidRating = (rating: number) => {
    return rating >= 800 && rating <= 3500 && rating % 100 === 0;
  };

  const handleRatingChange = (
    problem: keyof typeof customRatings,
    value: string
  ) => {
    if (value === "") {
      setCustomRatings((prev) => ({ ...prev, [problem]: 0 }));
      return;
    }
    const numValue = parseInt(value.replace(/^0+/, "") || "0", 10);
    setCustomRatings((prev) => ({ ...prev, [problem]: numValue }));
  };

  const handleRatingBlur = (problem: keyof typeof customRatings) => {
    if (!isValidRating(customRatings[problem])) {
      setCustomRatings((prev) => ({ ...prev, [problem]: 800 }));
    }
  };

  const handleStep = (
    problem: keyof typeof customRatings,
    direction: "up" | "down"
  ) => {
    const currentRating = customRatings[problem];
    let newRating =
      direction === "up" ? currentRating + 100 : currentRating - 100;
    if (newRating > 3500) newRating = 3500;
    if (newRating < 800) newRating = 800;
    setCustomRatings((prev) => ({ ...prev, [problem]: newRating }));
  };

  if (isLoading) {
    return <Loader />;
  }

  // Wait for user data to be loaded from localStorage
  if (!user) {
    return <Loader />;
  }

  // If training is active, show only the problems section
  if (isTraining) {
    return (
      <section className="container grid items-center gap-6 pb-6 pt-2 md:py-4">
        <Trainer
          isTraining={isTraining}
          training={training}
          problems={problems}
          generateProblems={generateProblems}
          startTraining={startTraining}
          stopTraining={stopTraining}
          refreshProblemStatus={refreshProblemStatus}
          finishTraining={finishTraining}
          selectedTags={selectedTags}
          lb={firstInput}
          ub={secondInput}
          customRatings={customRatings}
        />
      </section>
    );
  }

  return (
    <section className="container grid items-center gap-6 pb-6 pt-2 md:py-4">
      <div className="flex flex-col items-start gap-1">
        <h1 className="text-2xl font-bold leading-tight tracking-tight">
          Create a Contest
        </h1>
        <p className="text-sm text-muted-foreground">
          Select tags and problem ratings to generate your custom training
          session.
        </p>
      </div>

      <div className="space-y-8">
        <Card className="border-2 border-border/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="pt-6 space-y-8">
            {/* Tags Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Select Tags</h3>
        <TagSelector
          allTags={allTags}
          selectedTags={selectedTags}
          onTagClick={onTagClick}
          onClearTags={onClearTags}
        />
            </div>

            {/* Problem Ratings Section */}
        <div className="space-y-4">
              <h3 className="text-xl font-semibold">Set Problem Ratings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(customRatings).map(([problem, rating]) => {
              const isInvalid = rating !== 0 && !isValidRating(rating);
              return (
                <div key={problem} className="flex flex-col gap-2">
                  <label className="font-bold text-sm">{problem}:</label>
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 rounded-r-none"
                      onClick={() =>
                        handleStep(
                          problem as keyof typeof customRatings,
                          "down"
                        )
                      }
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      step="100"
                      value={rating || ""}
                      onChange={(e) =>
                        handleRatingChange(
                          problem as keyof typeof customRatings,
                          e.target.value
                        )
                      }
                      onBlur={() =>
                            handleRatingBlur(
                              problem as keyof typeof customRatings
                            )
                      }
                      className={`hide-spinners w-full h-12 text-lg font-semibold text-center rounded-none z-10 ${
                        isInvalid
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }`}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 rounded-l-none"
                      onClick={() =>
                            handleStep(
                              problem as keyof typeof customRatings,
                              "up"
                            )
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {isInvalid && (
                    <span className="text-red-500 text-xs">
                      Enter valid rating
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

            {/* Contest Round Range Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">
                Contest Round Range (Optional)
              </h3>
          <Textboxpair
            onFirstInputChange={onFirstInputChange}
            onSecondInputChange={onSecondInputChange}
              />
        </div>
          </CardContent>
        </Card>

        <Trainer
          isTraining={isTraining}
          training={training}
          problems={problems}
          generateProblems={generateProblems}
          startTraining={startTraining}
          stopTraining={stopTraining}
          refreshProblemStatus={refreshProblemStatus}
          finishTraining={finishTraining}
          selectedTags={selectedTags}
          lb={firstInput}
          ub={secondInput}
          customRatings={customRatings}
        />
      </div>
    </section>
  );
}
