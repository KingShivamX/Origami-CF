"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Target, Clock } from "lucide-react";

interface ContestCompleteMessageProps {
  solvedCount: number;
  totalProblems: number;
  performance: number;
  contestDuration: number;
}

export const ContestCompleteMessage = ({
  solvedCount,
  totalProblems,
  performance,
  contestDuration,
}: ContestCompleteMessageProps) => {
  const solveRate = (solvedCount / totalProblems) * 100;
  
  const getMotivationalMessage = () => {
    if (solvedCount === totalProblems) {
      return "🎉 Perfect! You solved all problems!";
    } else if (solvedCount >= totalProblems * 0.75) {
      return "🔥 Great job! You're getting stronger!";
    } else if (solvedCount >= totalProblems * 0.5) {
      return "💪 Good effort! Keep practicing!";
    } else if (solvedCount > 0) {
      return "📈 Every problem solved is progress!";
    } else {
      return "🚀 Don't give up! Every contest is learning!";
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <Card className="max-w-md mx-auto mt-8 border-green-200 bg-green-50">
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          {/* Header */}
          <div className="flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <h3 className="text-lg font-semibold">Contest Complete!</h3>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Target className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {solvedCount}/{totalProblems}
              </div>
              <div className="text-xs text-muted-foreground">Solved</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Trophy className="h-4 w-4 text-orange-500" />
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {performance}
              </div>
              <div className="text-xs text-muted-foreground">Performance</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Clock className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatDuration(contestDuration)}
              </div>
              <div className="text-xs text-muted-foreground">Duration</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${solveRate}%` }}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {solveRate.toFixed(0)}% Problems Solved
          </div>

          {/* Motivational Message */}
          <div className="p-3 bg-white rounded-lg border border-green-200">
            <p className="text-sm font-medium text-green-800">
              {getMotivationalMessage()}
            </p>
          </div>

          {/* Note about rating */}
          <div className="text-xs text-muted-foreground">
            Your rating has been updated based on this performance
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
