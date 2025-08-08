"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  BarChart,
  CheckCircle,
  RefreshCw,
  LogOut,
} from "lucide-react";
import useUser from "@/hooks/useUser";
import Loader from "@/components/Loader";
import Profile from "@/components/Profile";
import Settings from "@/components/Settings";
import ChangePinDialog from "@/components/ChangePinDialog";
import useHistory from "@/hooks/useHistory";
import useUpsolvedProblems from "@/hooks/useUpsolvedProblems";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import { useHeatmapData } from "@/hooks/useHeatmapData";
import { useState } from "react";

export default function Home() {
  const { user, isLoading: isUserLoading, logout, syncProfile } = useUser();
  const { history, isLoading: isHistoryLoading } = useHistory();
  const { upsolvedProblems, isLoading: isUpsolveLoading } =
    useUpsolvedProblems();
  const { totalSolved } = useHeatmapData(history || [], upsolvedProblems || []);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncProfile();
    setIsSyncing(false);
  };

  if (isUserLoading || isHistoryLoading || isUpsolveLoading) {
    return <Loader />;
  }

  if (!user) {
    return (
      <section className="container flex flex-col items-center justify-start pt-6 md:pt-14 gap-6 pb-8 px-4 md:px-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight lg:text-5xl">
            origami-cf
          </h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground">
            A better way to practice for Codeforces.
          </p>
        </div>
        <Settings />
      </section>
    );
  }

  return (
    <section className="container grid items-center gap-4 md:gap-6 pb-8 pt-6 md:py-10 px-4 md:px-6">
      <div className="flex flex-col items-start gap-2">
        <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-tighter lg:text-4xl">
          Welcome back, {user.codeforcesHandle}!
        </h1>
        <p className="text-base md:text-lg text-muted-foreground">
          Here's a summary of your recent activity and progress.
        </p>
      </div>
      <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-1">
          <Profile user={user} />
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Solved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSolved}</div>
            <p className="text-xs text-muted-foreground">
              problems solved across all sessions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contests</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{history?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              training sessions completed
            </p>
          </CardContent>
        </Card>
      </div>

      <ActivityHeatmap
        history={history || []}
        upsolvedProblems={upsolvedProblems || []}
      />

      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">
              Account Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={isSyncing}
                className="w-full text-sm"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
                />
                {isSyncing ? "Syncing..." : "Sync Profile"}
              </Button>
              <ChangePinDialog />
              <Button
                variant="destructive"
                size="sm"
                onClick={logout}
                className="w-full text-sm"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">
              Start a New Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 text-sm md:text-base">
              Ready for your next challenge? Create a custom training session.
            </p>
            <Button asChild size="sm" className="w-full text-sm">
              <Link href="/training">
                Go to Training <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
