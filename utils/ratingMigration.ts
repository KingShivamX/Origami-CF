import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Training from "@/models/Training";
import { calculateRatingChange, getRatingTier } from "@/utils/ratingSystem";
import { Training as TrainingType } from "@/types/Training";

/**
 * Rating Migration Utility
 * Recalculates all historical contest ratings using the new mathematical formula
 */

interface MigrationResult {
  totalUsers: number;
  totalTrainings: number;
  usersUpdated: number;
  trainingsProcessed: number;
  errors: string[];
  ratingChanges: {
    userId: string;
    handle: string;
    oldRating: number;
    newRating: number;
    delta: number;
    trainingsCount: number;
  }[];
}

/**
 * Recalculate all user ratings based on historical contests
 * This processes all trainings chronologically and applies the new rating formula
 */
export const migrateAllRatings = async (): Promise<MigrationResult> => {
  const result: MigrationResult = {
    totalUsers: 0,
    totalTrainings: 0,
    usersUpdated: 0,
    trainingsProcessed: 0,
    errors: [],
    ratingChanges: [],
  };

  try {
    await dbConnect();

    // Get all users
    const users = await User.find({});
    result.totalUsers = users.length;

    console.log(`🔄 Starting rating migration for ${users.length} users...`);

    for (const user of users) {
      try {
        const oldRating = user.rating;
        const oldRank = user.rank;
        const oldMaxRating = user.maxRating;

        // Reset user to starting values
        let currentRating = 1500; // Starting rating
        let maxRating = 1500;
        let maxRank = "Specialist";

        // Get all trainings for this user, sorted by start time (chronological order)
        const trainings = await Training.find({ user: user._id }).sort({
          startTime: 1,
        });

        if (trainings.length === 0) {
          // User has no trainings, just update to defaults
          await User.findByIdAndUpdate(user._id, {
            rating: 1500,
            rank: "Specialist",
            maxRating: 1500,
            maxRank: "Specialist",
          });
          continue;
        }

        console.log(
          `📊 Processing ${trainings.length} contests for user ${user.codeforcesHandle}...`
        );

        // Process each training chronologically
        for (const training of trainings) {
          try {
            // Convert MongoDB training to our Training type
            const trainingData: TrainingType = {
              _id: training._id.toString(),
              startTime: training.startTime,
              endTime: training.endTime,
              customRatings: training.customRatings,
              problems: training.problems,
              performance: training.performance,
            };

            // Calculate rating change using new system
            const ratingChange = calculateRatingChange(
              trainingData,
              currentRating
            );

            // Update current rating
            currentRating = ratingChange.newRating;

            // Track max rating
            if (currentRating > maxRating) {
              maxRating = currentRating;
              const maxTier = getRatingTier(maxRating);
              maxRank = maxTier.tier;
            }

            result.trainingsProcessed++;

            // Log progress every 10 trainings
            if (result.trainingsProcessed % 10 === 0) {
              console.log(
                `  ✅ Processed ${result.trainingsProcessed} trainings...`
              );
            }
          } catch (error) {
            result.errors.push(
              `Error processing training ${training._id} for user ${user.codeforcesHandle}: ${error}`
            );
            console.error(`❌ Error processing training:`, error);
          }
        }

        // Update user with final calculated values
        const finalTier = getRatingTier(currentRating);

        await User.findByIdAndUpdate(user._id, {
          rating: currentRating,
          rank: finalTier.tier,
          maxRating: maxRating,
          maxRank: maxRank,
        });

        // Track the changes
        result.ratingChanges.push({
          userId: user._id.toString(),
          handle: user.codeforcesHandle,
          oldRating: oldRating,
          newRating: currentRating,
          delta: currentRating - oldRating,
          trainingsCount: trainings.length,
        });

        result.usersUpdated++;
        result.totalTrainings += trainings.length;

        console.log(
          `✅ Updated ${user.codeforcesHandle}: ${oldRating} → ${currentRating} (${currentRating - oldRating >= 0 ? "+" : ""}${currentRating - oldRating}) after ${trainings.length} contests`
        );
      } catch (error) {
        result.errors.push(
          `Error processing user ${user.codeforcesHandle}: ${error}`
        );
        console.error(
          `❌ Error processing user ${user.codeforcesHandle}:`,
          error
        );
      }
    }

    console.log(`🎉 Migration completed!`);
    console.log(
      `📈 Users updated: ${result.usersUpdated}/${result.totalUsers}`
    );
    console.log(`📊 Total trainings processed: ${result.trainingsProcessed}`);
    console.log(`❌ Errors: ${result.errors.length}`);

    return result;
  } catch (error) {
    result.errors.push(`Fatal migration error: ${error}`);
    console.error("❌ Fatal migration error:", error);
    throw error;
  }
};

/**
 * Get migration preview without making changes
 * Shows what would happen if migration ran
 */
export const previewRatingMigration = async (): Promise<{
  usersToUpdate: number;
  totalTrainings: number;
  estimatedChanges: {
    handle: string;
    currentRating: number;
    estimatedNewRating: number;
    trainingsCount: number;
  }[];
}> => {
  await dbConnect();

  const users = await User.find({}).limit(10); // Preview first 10 users
  const preview = {
    usersToUpdate: 0,
    totalTrainings: 0,
    estimatedChanges: [] as any[],
  };

  for (const user of users) {
    const trainings = await Training.find({ user: user._id }).sort({
      startTime: 1,
    });

    if (trainings.length === 0) continue;

    let currentRating = 1500;

    // Quick simulation
    for (const training of trainings) {
      const trainingData: TrainingType = {
        _id: training._id.toString(),
        startTime: training.startTime,
        endTime: training.endTime,
        customRatings: training.customRatings,
        problems: training.problems,
        performance: training.performance,
      };

      const ratingChange = calculateRatingChange(trainingData, currentRating);
      currentRating = ratingChange.newRating;
    }

    preview.estimatedChanges.push({
      handle: user.codeforcesHandle,
      currentRating: user.rating,
      estimatedNewRating: currentRating,
      trainingsCount: trainings.length,
    });

    preview.totalTrainings += trainings.length;
  }

  const allUsers = await User.countDocuments({});
  preview.usersToUpdate = allUsers;

  return preview;
};

/**
 * Recalculate rating for a specific user
 * Useful for individual fixes or testing
 */
export const recalculateUserRating = async (
  codeforcesHandle: string
): Promise<{
  oldRating: number;
  newRating: number;
  delta: number;
  trainingsProcessed: number;
}> => {
  await dbConnect();

  const user = await User.findOne({ codeforcesHandle });
  if (!user) {
    throw new Error(`User ${codeforcesHandle} not found`);
  }

  const oldRating = user.rating;
  let currentRating = 1500;
  let maxRating = 1500;

  const trainings = await Training.find({ user: user._id }).sort({
    startTime: 1,
  });

  for (const training of trainings) {
    const trainingData: TrainingType = {
      _id: training._id.toString(),
      startTime: training.startTime,
      endTime: training.endTime,
      customRatings: training.customRatings,
      problems: training.problems,
      performance: training.performance,
    };

    const ratingChange = calculateRatingChange(trainingData, currentRating);
    currentRating = ratingChange.newRating;
    maxRating = Math.max(maxRating, currentRating);
  }

  // Update user
  const finalTier = getRatingTier(currentRating);
  const maxTier = getRatingTier(maxRating);

  await User.findByIdAndUpdate(user._id, {
    rating: currentRating,
    rank: finalTier.tier,
    maxRating: maxRating,
    maxRank: maxTier.tier,
  });

  return {
    oldRating,
    newRating: currentRating,
    delta: currentRating - oldRating,
    trainingsProcessed: trainings.length,
  };
};
