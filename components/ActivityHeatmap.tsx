"use client";

import HeatMap from "@uiw/react-heat-map";
import { useTheme } from "next-themes";
import { useHeatmapData } from "@/hooks/useHeatmapData";
import { Training } from "@/types/Training";
import { TrainingProblem } from "@/types/TrainingProblem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo, useState, useEffect } from "react";
import ClientOnly from "@/components/ClientOnly";

interface ActivityHeatmapProps {
  history: Training[];
  upsolvedProblems?: TrainingProblem[];
}

const ActivityHeatmap = ({
  history,
  upsolvedProblems = [],
}: ActivityHeatmapProps) => {
  const { theme } = useTheme();
  const { values: heatmapData } = useHeatmapData(history, upsolvedProblems);

  const [containerWidth, setContainerWidth] = useState(800);
  const [monthsToShow, setMonthsToShow] = useState(12);

  useEffect(() => {
    const updateDimensions = () => {
      if (typeof window !== "undefined") {
        const width = window.innerWidth;
        setContainerWidth(width);

        // Calculate how many months can fit
        // Each week is about 15px wide (rectSize + space), and there are ~4.3 weeks per month
        // So roughly 65px per month, plus some padding
        const availableWidth = Math.min(width - 200, 1000); // Constrain to container and max width
        const monthWidth = 65; // Approximate width per month
        const maxMonths = Math.floor(availableWidth / monthWidth);

        // Show between 3 and 12 months based on available space
        const months = Math.max(3, Math.min(12, maxMonths));
        setMonthsToShow(months);
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const [startDate, endDate] = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - monthsToShow);
    return [start, end];
  }, [monthsToShow]);

  return (
    <ClientOnly>
      <Card>
        <CardHeader>
          <CardTitle>Activity Heatmap</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto overflow-y-visible p-4 pb-6">
            <div className="w-full flex justify-start">
              <HeatMap
                value={heatmapData}
                width={Math.max(300, Math.min(containerWidth - 200, 1000))}
                rectSize={13}
                space={3}
                startDate={startDate}
                endDate={endDate}
                style={{ color: theme === "dark" ? "#a1a1aa" : "#4b5563" }}
                panelColors={{
                  0: theme === "dark" ? "#1f2937" : "#f3f4f6", // No activity
                  1: theme === "dark" ? "#0f3f26" : "#c6e48b", // 1 question solved (lightest)
                  2: theme === "dark" ? "#166534" : "#7bc96f",
                  3: theme === "dark" ? "#1a7c40" : "#239a3b",
                  4: theme === "dark" ? "#22c55e" : "#196127", // 4+ questions solved (brightest/darkest)
                }}
                legendCellSize={0}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </ClientOnly>
  );
};

export default ActivityHeatmap;
