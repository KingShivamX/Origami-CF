import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

const CountDown = ({
  startTime,
  endTime,
}: {
  startTime: number;
  endTime: number;
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const calculateTimeLeft = () => {
      const now = Date.now();
      if (now < startTime) {
        setIsStarted(false);
        return startTime - now;
      }
      if (now < endTime) {
        setIsStarted(true);
        return endTime - now;
      }
      setIsStarted(true);
      return 0;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, endTime, mounted]);

  if (!mounted) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-center">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-2xl font-bold text-center">
          {timeLeft === 0 ? (
            isStarted ? (
              <span className="text-red-500">Training has ended</span>
            ) : (
              <span className="text-green-500">Training will start soon</span>
            )
          ) : (
            <span>
              {!isStarted && "Training will start in "}
              {hours.toString().padStart(2, "0")}:
              {minutes.toString().padStart(2, "0")}:
              {seconds.toString().padStart(2, "0")}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CountDown;
