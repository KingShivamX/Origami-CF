import { useState, useEffect } from "react";

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
      <div className="bg-muted/50 rounded-lg border-2 border-border/50 px-6 py-4">
        <div className="text-2xl font-bold text-center text-foreground">
          Loading...
        </div>
      </div>
    );
  }

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <div className="bg-muted/50 rounded-lg border-2 border-border/50 px-6 py-4">
      <div className="text-center">
        {timeLeft === 0 ? (
          isStarted ? (
            <span className="text-[#B71F25] text-xl font-semibold">
              Training has ended
            </span>
          ) : (
            <span className="text-[#1A92CF] text-xl font-semibold">
              Training will start soon
            </span>
          )
        ) : (
          <div className="space-y-1">
            {!isStarted && (
              <div className="text-sm font-medium text-muted-foreground">
                Training will start in
              </div>
            )}
            <div className="text-2xl font-bold font-mono text-foreground">
              {hours.toString().padStart(2, "0")}:
              {minutes.toString().padStart(2, "0")}:
              {seconds.toString().padStart(2, "0")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CountDown;
