"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  BarChart,
  CheckCircle,
  RefreshCw,
  Zap,
  LogOut,
} from "lucide-react";
import useUser from "@/hooks/useUser";
import Loader from "@/components/Loader";
import Profile from "@/components/Profile";
import Settings from "@/components/Settings";
import ChangePinDialog from "@/components/ChangePinDialog";
import useHistory from "@/hooks/useHistory";
import useUpsolvedProblems from "@/hooks/useUpsolvedProblems";
import useCustomProblems from "@/hooks/useCustomProblems";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import { useHeatmapData } from "@/hooks/useHeatmapData";
import { useState } from "react";

export default function Home() {
  const { user, isLoading: isUserLoading, logout, syncProfile } = useUser();
  const { history, isLoading: isHistoryLoading } = useHistory();
  const { upsolvedProblems, isLoading: isUpsolveLoading } =
    useUpsolvedProblems();
  const { customProblems, isLoading: isCustomLoading } = useCustomProblems();
  const { totalSolved } = useHeatmapData(
    history || [],
    upsolvedProblems || [],
    customProblems || []
  );
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncProfile();
    setIsSyncing(false);
  };

  // Only wait for user loading, load other data in background
  if (isUserLoading) {
    return <Loader />;
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row overflow-hidden">

        {/* ══ Left panel ══ */}
        <div className="hidden lg:flex flex-col justify-center flex-1 relative px-14 xl:px-20 py-16 border-r border-border overflow-hidden">

          {/* Animated background blobs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="animate-float-a absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
            <div className="animate-float-b absolute bottom-0 right-0 w-80 h-80 rounded-full bg-primary/8 blur-3xl" />
            <div className="animate-pulse-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-accent/5 blur-2xl" />
          </div>

          <div className="relative max-w-lg z-10">

            {/* Brand */}
            <div className="animate-fade-up mb-2">
              <span className="text-xs font-semibold tracking-widest uppercase text-primary/70 border border-primary/20 rounded-full px-3 py-1 bg-primary/5">
                Codeforces Training Platform
              </span>
            </div>
            <h1 className="animate-fade-up-1 text-5xl xl:text-6xl font-extrabold tracking-tight text-foreground mt-4 mb-4">
              origami<span className="text-primary">-cf</span>
            </h1>
            <p className="animate-fade-up-2 text-lg text-muted-foreground mb-10 leading-relaxed max-w-md">
              Structured virtual contests, smart problem selection, and personal
              performance tracking — all in one focused tool.
            </p>

            {/* Animated rating bar visual */}
            <div className="animate-fade-up-3 mb-10 rounded-xl border border-border bg-card/60 backdrop-blur-sm p-5 space-y-3">
              <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">Your progress at a glance</p>
              {[
                { label: "Virtual Contests", w: "80%" },
                { label: "Upsolving",        w: "62%" },
                { label: "Rating Growth",    w: "91%" },
              ].map(({ label, w }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground font-medium">{label}</span>
                    <span className="text-primary font-semibold">{w}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-border overflow-hidden">
                    <div
                      className="animate-bar-grow h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
                      style={{ width: w }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Feature list — lucide icons, no emojis */}
            <ul className="animate-fade-up-4 space-y-4">
              {[
                { Icon: Zap,       title: "Virtual Contests",  desc: "Auto-selected problems tuned to your rating range." },
                { Icon: BarChart,  title: "Rating System",     desc: "Elo-style rating updated after every contest." },
                { Icon: CheckCircle, title: "Upsolve Queue",   desc: "Missed problems queued automatically after each session." },
                { Icon: RefreshCw, title: "Profile Sync",      desc: "CF stats refreshed every 24 hours, no manual effort." },
              ].map(({ Icon, title, desc }) => (
                <li key={title} className="flex gap-3 items-start">
                  <span className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </span>
                  <div>
                    <p className="font-semibold text-foreground text-sm leading-snug">{title}</p>
                    <p className="text-xs text-muted-foreground leading-snug">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ══ Right panel — auth form ══ */}
        <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 lg:py-0 lg:w-[420px] lg:flex-none xl:w-[480px]">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-8 animate-fade-up">
            <h1 className="text-4xl font-extrabold tracking-tight">
              origami<span className="text-primary">-cf</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              A better way to practice for Codeforces.
            </p>
          </div>
          <div className="animate-fade-up-1 w-full max-w-sm">
            <Settings />
          </div>
        </div>

      </div>
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
        <Card className="flex flex-col justify-center min-h-[120px] sm:min-h-[140px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm sm:text-base font-medium">
              Total Solved
            </CardTitle>
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center items-center text-center px-3 py-2">
            <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-1 sm:mb-2">
              {totalSolved}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-tight max-w-full">
              problems solved across all sessions
            </p>
          </CardContent>
        </Card>
        <Card className="flex flex-col justify-center min-h-[120px] sm:min-h-[140px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm sm:text-base font-medium">
              Contests
            </CardTitle>
            <BarChart className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center items-center text-center px-3 py-2">
            <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-1 sm:mb-2">
              {history?.length || 0}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-tight max-w-full">
              contests completed
            </p>
          </CardContent>
        </Card>
      </div>

      <ActivityHeatmap
        history={history || []}
        upsolvedProblems={upsolvedProblems || []}
        customProblems={customProblems || []}
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
              Create a Virtual Contest
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 text-sm md:text-base">
              Ready for your next challenge? Create a custom virtual contest.
            </p>
            <Button asChild size="sm" className="w-full text-sm">
              <Link href="/contest">
                Create Virtual Contest <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
