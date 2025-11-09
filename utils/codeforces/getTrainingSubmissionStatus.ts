import { User } from "@/types/User";
import { TrainingProblem } from "@/types/TrainingProblem";
import { CodeforcesSubmission } from "@/types/Codeforces";
import { SuccessResponse, ErrorResponse, Response } from "@/types/Response";
import getSubmissions from "@/utils/codeforces/getSubmissions";

export type SubmissionStatus = {
  problemId: string; // format: "contestId_index"
  status: "AC" | "WA" | "TESTING" | "none"; // AC = accepted, WA = actual failures, TESTING = in progress/partial/other
  lastSubmissionTime?: number;
};

const getTrainingSubmissionStatus = async (
  user: User,
  problems: TrainingProblem[],
  trainingStartTime: number
): Promise<Response<SubmissionStatus[]>> => {
  try {
    const res = await getSubmissions(user);
    if (!res.success) {
      return ErrorResponse(res.error);
    }

    const submissions = res.data;
    const problemIds = problems.map((p) => `${p.contestId}_${p.index}`);
    const submissionStatuses: SubmissionStatus[] = [];

    for (const problem of problems) {
      const problemId = `${problem.contestId}_${problem.index}`;

      // Filter submissions for this specific problem that happened during training
      const problemSubmissions = submissions
        .filter(
          (sub: CodeforcesSubmission) =>
            sub.problem.contestId === problem.contestId &&
            sub.problem.index === problem.index &&
            sub.creationTimeSeconds * 1000 >= trainingStartTime // Only submissions during training
        )
        .sort(
          (a: CodeforcesSubmission, b: CodeforcesSubmission) =>
            b.creationTimeSeconds - a.creationTimeSeconds // Most recent first
        );

      if (problemSubmissions.length === 0) {
        submissionStatuses.push({
          problemId,
          status: "none",
        });
        continue;
      }

      // Check for AC first, as it's the final success state
      const acceptedSubmission = problemSubmissions.find(
        (sub: CodeforcesSubmission) => sub.verdict === "OK"
      );

      if (acceptedSubmission) {
        submissionStatuses.push({
          problemId,
          status: "AC",
          lastSubmissionTime: acceptedSubmission.creationTimeSeconds * 1000,
        });
        continue;
      }

      // Get the latest submission to check its verdict
      const latestSubmission = problemSubmissions[0];
      
      // Define actual failure verdicts (should be red)
      const failureVerdicts = [
        "WRONG_ANSWER",
        "COMPILATION_ERROR", 
        "RUNTIME_ERROR",
        "TIME_LIMIT_EXCEEDED",
        "MEMORY_LIMIT_EXCEEDED",
        "IDLENESS_LIMIT_EXCEEDED",
        "SECURITY_VIOLATED",
        "CRASHED",
        "INPUT_PREPARATION_CRASHED",
        "REJECTED",
        "FAILED"
      ];
      
      // Check if it's an actual failure
      if (failureVerdicts.includes(latestSubmission.verdict)) {
        submissionStatuses.push({
          problemId,
          status: "WA",
          lastSubmissionTime: latestSubmission.creationTimeSeconds * 1000,
        });
        continue;
      }

      // Everything else (TESTING, SUBMITTED, IN_QUEUE, PARTIAL, SKIPPED, CHALLENGED, etc.) should be blue
      submissionStatuses.push({
        problemId,
        status: "TESTING",
        lastSubmissionTime: latestSubmission.creationTimeSeconds * 1000,
      });
    }

    return SuccessResponse(submissionStatuses);
  } catch (error) {
    return ErrorResponse((error as Error).message);
  }
};

export default getTrainingSubmissionStatus;
