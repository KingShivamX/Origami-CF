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
      <div className="bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl border-2 border-primary/30 shadow-lg px-8 py-6">
        <div className="text-5xl font-bold text-center text-primary tracking-wider">
          Loading...
        </div>
      </div>
    );
  }

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <div className="bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl border-2 border-primary/30 shadow-lg px-8 py-6">
      <div className="text-5xl font-bold text-center text-primary tracking-wider">
        {timeLeft === 0 ? (
          isStarted ? (
            <span className="text-red-500 text-3xl">Training has ended</span>
          ) : (
            <span className="text-green-500 text-3xl">
              Training will start soon
            </span>
          )
        ) : (
          <div className="space-y-2">
            {!isStarted && (
              <div className="text-lg font-medium text-muted-foreground">
                Training will start in
              </div>
            )}
            <div className="font-mono">
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
