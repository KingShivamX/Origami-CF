"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import useUser from "@/hooks/useUser";
import useTraining from "@/hooks/useTraining";
import Trainer from "@/components/Trainer";
import TagSelector from "@/components/TagSelector";
import Loader from "@/components/Loader";
import Error from "@/components/Error";
import useTags from "@/hooks/useTags";
import useBounds from "@/hooks/useBounds";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textboxpair } from "@/components/ui/textboxpair";

const Training = () => {
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
  const contestTime = 120; // Fixed to 120 minutes

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

  if (!user) {
    return <Error />;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Let&apos;s Practice!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <TagSelector
          allTags={allTags}
          selectedTags={selectedTags}
          onTagClick={onTagClick}
          onClearTags={onClearTags}
        />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Custom Contest Setup</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                        handleRatingBlur(problem as keyof typeof customRatings)
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
                        handleStep(problem as keyof typeof customRatings, "up")
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

        <div className="flex place-content-between">
          <Textboxpair
            onFirstInputChange={onFirstInputChange}
            onSecondInputChange={onSecondInputChange}
          ></Textboxpair>
        </div>

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
          contestTime={contestTime}
        />
      </CardContent>
    </Card>
  );
};

export default Training;
