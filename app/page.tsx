"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart,
  CheckCircle,
  RefreshCw,
  LogOut,
} from "lucide-react";

// Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loader from "@/components/Loader";
import Profile from "@/components/Profile";
import Settings from "@/components/Settings";
import ChangePinDialog from "@/components/ChangePinDialog";
import ActivityHeatmap from "@/components/ActivityHeatmap";

// Hooks & Utilities
import { cn } from "@/lib/utils";
import useUser from "@/hooks/useUser";
import useHistory from "@/hooks/useHistory";
import useUpsolvedProblems from "@/hooks/useUpsolvedProblems";
import useCustomProblems from "@/hooks/useCustomProblems";
import { useHeatmapData } from "@/hooks/useHeatmapData";

export default function Home() {
  const { user, isLoading: isUserLoading, logout, syncProfile } = useUser();
  const { history } = useHistory();
  const { upsolvedProblems } = useUpsolvedProblems();
  const { customProblems } = useCustomProblems();

  const { totalSolved } = useHeatmapData(
    history || [],
    upsolvedProblems || [],
    customProblems || []
  );

  const [isSyncing, setIsSyncing] = useState(false);

  // Enhanced with proper error handling and predictable state resets
  const handleSync = async () => {
    try {
      setIsSyncing(true);
      await syncProfile();
      // Optional: Add a success toast notification here
    } catch (error) {
      console.error("Failed to sync profile:", error);
      // Optional: Add an error toast notification here
    } finally {
      setIsSyncing(false);
    }
  };

  const scrollToAuth = () => {
    document.getElementById("auth-section")?.scrollIntoView({ behavior: "smooth" });
  };

  if (isUserLoading) {
    return <Loader />;
  }

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
      },
    },
  };

  // ---------------------------------------------------------------------------
  // UNAUTHENTICATED VIEW
  // ---------------------------------------------------------------------------
  if (!user) {
    return (
      <div className="relative isolate min-h-screen overflow-hidden bg-backgroundPrimary">
        {/* Animated Background 3D Objects */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[5%] -z-10 h-64 w-64 rounded-full bg-gradient-to-br from-accentPrimary/20 to-transparent blur-3xl opacity-40"
        />
        <motion.div
          animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] right-[10%] -z-10 h-96 w-96 rounded-full bg-gradient-to-bl from-purple-500/10 to-transparent blur-3xl opacity-30"
        />

        <section className="container-custom relative flex flex-col items-center justify-center min-h-[90vh] text-center gap-12 pt-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="z-10 max-w-4xl"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-sm font-semibold border rounded-full border-accentPrimary/20 bg-accentPrimary/5 text-accentPrimary"
            >
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-accentPrimary"></span>
                <span className="relative inline-flex w-2 h-2 rounded-full bg-accentPrimary"></span>
              </span>
              The Future of Competitive Programming
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="mb-8 drop-shadow-2xl"
              style={{ transformStyle: "preserve-3d" }}
            >
              Level up your <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accentPrimary via-purple-500 to-accentPrimary bg-[length:200%_auto] animate-gradient-flow">
                Competitive
              </span>{" "}
              Programming
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="max-w-2xl mx-auto mb-10 font-medium leading-relaxed opacity-90 body-large text-textSecondary"
            >
              A high-performance workspace for elite developers. Practice with
              precision, track your progress, and master the algorithms.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center justify-center gap-6 sm:flex-row"
            >
              <Button
                size="lg"
                onClick={scrollToAuth}
                className="h-14 px-10 rounded-[14px] text-lg font-bold shadow-2xl shadow-accentPrimary/40 group relative overflow-hidden"
              >
                <span className="relative z-10">Get Started</span>
                <ArrowRight className="relative z-10 w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-accentPrimary to-purple-600 group-hover:opacity-100" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Centered Login/Register Form */}
          <motion.div
            id="auth-section"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative z-10 w-full max-w-lg group scroll-mt-24"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-accentPrimary/20 to-purple-500/20 rounded-[28px] blur opacity-25 group-hover:opacity-50 transition duration-1000" />
            <div className="relative p-1 overflow-hidden border shadow-2xl bg-surface/30 backdrop-blur-2xl border-white/10 rounded-[24px]">
              <Settings />
            </div>
          </motion.div>
        </section>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // AUTHENTICATED VIEW
  // ---------------------------------------------------------------------------
  return (
    <div className="relative isolate min-h-screen pb-20">
      <main className="relative pt-8 space-y-12 container-custom">
        {/* Floating Background Accent */}
        <div className="absolute top-[20%] -right-20 -z-10 h-72 w-72 bg-accentPrimary/5 blur-[100px] rounded-full" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-1 gap-8 lg:grid-cols-3"
        >
          {/* Main Content Column */}
          <div className="space-y-12 lg:col-span-2">
            <motion.div variants={itemVariants}>
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h1 className="mb-2 tracking-tight">
                    Welcome,{" "}
                    <span className="text-accentPrimary">
                      {user.codeforcesHandle}
                    </span>
                  </h1>
                  <p className="max-w-lg body-large text-textSecondary">
                    Algorithmic performance overview and recent activity.
                  </p>
                </div>
              </div>
              <Profile user={user} />
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold">Global Performance Track</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-6 rounded-full text-accentPrimary hover:bg-accentPrimary/5"
                >
                  Full History <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <Card className="p-0 overflow-hidden backdrop-blur-md border-white/5 bg-white/5">
                <CardContent className="pt-[32px]">
                  <ActivityHeatmap
                    history={history || []}
                    upsolvedProblems={upsolvedProblems || []}
                    customProblems={customProblems || []}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            <motion.div variants={itemVariants}>
              <Card className=" shadow-2xl bg-gradient-to-br from-accentPrimary/10 to-transparent border-accentPrimary/20 shadow-accentPrimary/5">
                <CardHeader>
                  <CardTitle className="text-xl">System Workspace</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="outline"
                    className="justify-between w-full h-12 group rounded-xl border-white/10"
                    onClick={handleSync}
                    disabled={isSyncing}
                  >
                    <span className="font-semibold">
                      {isSyncing ? "Calibrating..." : "Sync CF Universe"}
                    </span>
                    <RefreshCw
                      className={cn("h-4 w-4", isSyncing && "animate-spin")}
                    />
                  </Button>

                  {/* Cleaned up brittle wildcard CSS targeting */}
                  <div className="flex w-full text-base font-bold child-w-full">
                    <div className="w-full h-12 flex items-center justify-center rounded-xl bg-transparent">
                      <ChangePinDialog />
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="justify-between w-full h-12 text-red-500 border-white/10 rounded-xl hover:text-red-300 hover:bg-red-500/10"
                    onClick={logout}
                  >
                    <span className="font-semibold">Terminate Session</span>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="relative overflow-hidden backdrop-blur-md border-white/5 bg-white/5">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <BarChart className="w-32 h-32" />
                </div>
                <CardHeader>
                  <CardTitle className="text-xl font-bold">
                    Algorithm Mastery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div className="flex items-end justify-between">
                      <div className="space-y-1">
                        <span className="text-xs font-bold tracking-widest uppercase text-textSecondary">
                          Solved Index
                        </span>
                        <div className="text-4xl font-black text-white">
                          {totalSolved}
                        </div>
                      </div>
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accentPrimary/20">
                        <CheckCircle className="w-5 h-5 text-accentPrimary" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold tracking-wider uppercase text-textSecondary">
                        <span>Progress to Tier 2</span>
                        <span>65%</span>
                      </div>
                      <div className="w-full h-2 overflow-hidden rounded-full bg-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "65%" }}
                          transition={{
                            duration: 1.5,
                            ease: "circOut",
                            delay: 1,
                          }}
                          className="h-full bg-gradient-to-r from-accentPrimary to-purple-500 shadow-[0_0_10px_rgba(124,58,237,0.5)]"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-white/5 bg-surface/30 backdrop-blur-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Upcoming Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-6 text-sm font-medium text-textSecondary">
                    No scheduled training sessions detected in your workspace.
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="w-full h-12 font-bold text-white shadow-sm rounded-xl bg-white/5 hover:bg-white/10 border-white/10"
                  >
                    <Link
                      href="/contest"
                      className="flex items-center justify-center"
                    >
                      Launch Contest <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
