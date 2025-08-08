"use client";

import useHistory from "@/hooks/useHistory";
import useUser from "@/hooks/useUser";
import Loader from "@/components/Loader";
import Error from "@/components/Error";
import History from "@/components/History";
import ProgressChart from "@/components/ProgressChart";

export default function StatisticsPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const { history, isLoading, deleteTraining, isDeleting } = useHistory();

  if (isLoading || isUserLoading) {
    return <Loader />;
  }

  // Wait for user data to be loaded from localStorage
  if (!user) {
    return <Loader />;
  }

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
      <div className="space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="flex flex-col items-start gap-2 sm:gap-3">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight">
            Your Progress
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            Review your past training sessions and track your performance over
            time.
          </p>
        </div>

        {/* Content Section */}
        {history && history.length > 0 ? (
          <div className="space-y-6 sm:space-y-8 lg:space-y-10">
            <ProgressChart history={history} />
            <div className="space-y-4">
              <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
                Training History
              </h2>
              <History
                history={history}
                deleteTraining={(trainingId: string) =>
                  deleteTraining(trainingId)
                }
                isDeleting={isDeleting}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
            <div className="space-y-3">
              <h3 className="text-lg sm:text-xl font-medium text-muted-foreground">
                No training history yet
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground/80 max-w-md">
                Start your first training session to see your progress here.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
