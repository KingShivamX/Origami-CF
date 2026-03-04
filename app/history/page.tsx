"use client";

import useHistory from "@/hooks/useHistory";
import useUser from "@/hooks/useUser";
import Loader from "@/components/Loader";
import History from "@/components/History";
import ProgressChart from "@/components/ProgressChart";
import { motion } from "framer-motion";

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.section
      className="container flex flex-col gap-10 pb-20 pt-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div className="flex flex-col items-start gap-2" variants={itemVariants}>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
          Your <span className="text-accentPrimary">History</span>
        </h1>
        <p className="text-lg text-textSecondary font-medium max-w-2xl">
          Review your evolution. Track your algorithmic growth and analyze past performance metrics.
        </p>
      </motion.div>

      {/* Content Section */}
      {history && history.length > 0 ? (
        <div className="space-y-12">
          <motion.div variants={itemVariants}>
            <ProgressChart history={history} />
          </motion.div>
          <motion.div className="space-y-6" variants={itemVariants}>
            <h2 className="text-2xl font-bold tracking-tight">
              Contest Log
            </h2>
            <History
              history={history}
              deleteTraining={(trainingId: string) =>
                deleteTraining(trainingId)
              }
              isDeleting={isDeleting}
            />
          </motion.div>
        </div>
      ) : (
        <motion.div
          className="text-center py-16 text-muted-foreground"
          variants={itemVariants}
        >
          No contest history yet. Start your first virtual contest to see your progress here.
        </motion.div>
      )}
    </motion.section>
  );
}
