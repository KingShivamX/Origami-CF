"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Trophy, Target } from "lucide-react";

interface RatingChangeData {
  oldRating: number;
  newRating: number;
  ratingDelta: number;
  newRank: string;
  isNewMaxRating: boolean;
  performance: number;
  solvedCount: number;
  totalProblems: number;
}

interface RatingChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  ratingChange: RatingChangeData | null;
}

export const RatingChangeModal = ({ isOpen, onClose, ratingChange }: RatingChangeModalProps) => {
  if (!ratingChange) return null;

  const { oldRating, newRating, ratingDelta, newRank, isNewMaxRating, performance, solvedCount, totalProblems } = ratingChange;
  
  const isPositive = ratingDelta > 0;
  const isNeutral = ratingDelta === 0;
  
  const getRatingColor = (rating: number) => {
    if (rating < 1200) return "text-gray-600";
    if (rating < 1400) return "text-green-600";
    if (rating < 1600) return "text-cyan-600";
    if (rating < 1900) return "text-blue-600";
    if (rating < 2100) return "text-violet-600";
    if (rating < 2300) return "text-orange-600";
    return "text-red-600";
  };

  const formatRatingChange = (delta: number) => {
    if (delta === 0) return "±0";
    return delta > 0 ? `+${delta}` : `${delta}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Contest Complete!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Rating Change Display */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Previous</div>
                <div className={`text-2xl font-bold ${getRatingColor(oldRating)}`}>
                  {oldRating}
                </div>
              </div>
              
              <div className="flex items-center">
                {isPositive ? (
                  <TrendingUp className="h-6 w-6 text-green-500" />
                ) : isNeutral ? (
                  <Target className="h-6 w-6 text-gray-500" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-500" />
                )}
              </div>
              
              <div className="text-center">
                <div className="text-sm text-muted-foreground">New</div>
                <div className={`text-2xl font-bold ${getRatingColor(newRating)}`}>
                  {newRating}
                </div>
              </div>
            </div>
            
            {/* Rating Delta */}
            <div className="flex items-center justify-center gap-2">
              <span className={`text-lg font-semibold ${
                isPositive ? "text-green-600" : isNeutral ? "text-gray-600" : "text-red-600"
              }`}>
                {formatRatingChange(ratingDelta)}
              </span>
              {isNewMaxRating && (
                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                  New Max!
                </Badge>
              )}
            </div>
            
            {/* New Rank */}
            <Badge variant="secondary" className="text-sm">
              {newRank}
            </Badge>
          </div>
          
          {/* Performance Stats */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Problems Solved</div>
              <div className="text-lg font-semibold">
                {solvedCount}/{totalProblems}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Performance</div>
              <div className="text-lg font-semibold">
                {performance}
              </div>
            </div>
          </div>
          
          {/* Motivational Message */}
          <div className="text-center text-sm text-muted-foreground">
            {isPositive && (
              <p>🎉 Great job! Your rating increased by {Math.abs(ratingDelta)} points!</p>
            )}
            {isNeutral && (
              <p>💪 Keep practicing to improve your performance!</p>
            )}
            {!isPositive && !isNeutral && (
              <p>📈 Don't give up! Every contest is a learning opportunity!</p>
            )}
          </div>
          
          {/* Close Button */}
          <Button onClick={onClose} className="w-full">
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
