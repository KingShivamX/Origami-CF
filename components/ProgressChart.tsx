import { Training } from "@/types/Training";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ProgressChart = ({ history }: { history: Training[] }) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  // Sort data chronologically (oldest to newest) for proper left-to-right display
  const chartData = [...history].sort((a, b) => a.startTime - b.startTime);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg sm:text-xl">Progress Chart</CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <ResponsiveContainer
          width="100%"
          height={280}
          className="sm:h-[320px] lg:h-[380px]"
        >
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 10,
              left: 5,
              bottom: 5,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-muted opacity-30"
            />
            <XAxis
              dataKey="startTime"
              tickFormatter={formatDate}
              interval="preserveStartEnd"
              className="text-muted-foreground text-xs sm:text-sm"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(value) => `${value}`}
              className="text-muted-foreground text-xs sm:text-sm"
              tick={{ fontSize: 12 }}
              width={30}
            />
            <Tooltip
              labelFormatter={formatDate}
              formatter={(value: number) => [`${value}`, "Performance"]}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "14px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Line
              type="monotone"
              dataKey="performance"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 3 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ProgressChart;
