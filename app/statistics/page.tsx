"use client";

import useHistory from "@/hooks/useHistory";
import Loader from "@/components/Loader";
import History from "@/components/History";
import ProgressChart from "@/components/ProgressChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Statistics = () => {
  const { history, isLoading, deleteTraining } = useHistory();

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        {history && history.length > 0 ? (
          <>
            <div className="w-full mb-6">
              <ProgressChart history={history} />
            </div>
            <History
              history={history}
              deleteTraining={(training: any) => deleteTraining(training._id)}
            />
          </>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No training history
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Statistics;
