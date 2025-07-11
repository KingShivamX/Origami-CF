"use client";

import useHistory from "@/hooks/useHistory";
import useUser from "@/hooks/useUser";
import Loader from "@/components/Loader";
import Error from "@/components/Error";
import History from "@/components/History";
import ProgressChart from "@/components/ProgressChart";

export default function StatisticsPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const { history, isLoading, deleteTraining } = useHistory();

  if (isLoading || isUserLoading) {
    return <Loader />;
  }

  if (!user) {
    return <Error />;
  }

  return (
    <section className="container grid items-center gap-6 pb-6 pt-2 md:py-4">
      <div className="flex flex-col items-start gap-1">
        <h1 className="text-2xl font-bold leading-tight tracking-tight">
          Your Progress
        </h1>
        <p className="text-sm text-muted-foreground">
          Review your past training sessions and track your performance over
          time.
        </p>
      </div>

      {history && history.length > 0 ? (
        <div className="space-y-8">
          <ProgressChart history={history} />
          <History
            history={history}
            deleteTraining={(training: any) =>
              deleteTraining(training._id.toString())
            }
          />
        </div>
      ) : (
        <div className="text-center py-16 text-lg text-muted-foreground">
          You have no training history yet.
        </div>
      )}
    </section>
  );
}
