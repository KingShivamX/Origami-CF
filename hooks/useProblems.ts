import { useState, useEffect, useCallback } from "react";
import useSWR from "swr";
import { CodeforcesProblem, ProblemTag } from "@/types/Codeforces";
import getAllProblems from "@/utils/codeforces/getAllProblems";
import getSolvedProblems from "@/utils/codeforces/getSolvedProblems";
import { User } from "@/types/User";

const PROBLEMS_CACHE_KEY = "codeforces-all-problems";
const SOLVED_PROBLEMS_CACHE_KEY = (handle: string) =>
  `codeforces-solved-${handle}`;

const useProblems = (user: User | null | undefined) => {
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all problems
  const { data: allProblems, isLoading: isLoadingAll } = useSWR<
    CodeforcesProblem[]
  >(
    PROBLEMS_CACHE_KEY,
    async () => {
      const res = await getAllProblems();
      if (!res.success) {
        throw new Error("Failed to fetch problems");
      }
      return res.data;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 3600000,
    }
  );

  // Fetch solved problems only if we have a user
  const {
    data: solvedProblems,
    isLoading: isLoadingSolved,
    mutate: mutateSolved,
  } = useSWR<CodeforcesProblem[]>(
    user ? SOLVED_PROBLEMS_CACHE_KEY(user.codeforcesHandle) : null,
    async () => {
      if (!user) {
        throw new Error("No user");
      }
      const res = await getSolvedProblems(user);
      if (!res.success) {
        throw new Error("Failed to fetch solved problems");
      }
      return res.data;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000,
    }
  );

  const refreshSolvedProblems = useCallback(async () => {
    if (!user) {
      return;
    }

    setIsLoading(true);

    try {
      // Await the mutation and capture the updated data
      const updatedData = await mutateSolved(
        async () => {
          const res = await getSolvedProblems(user);
          if (!res.success) {
            throw new Error("Failed to fetch solved problems");
          }
          return res.data;
        },
        { revalidate: true }
      );

      setIsLoading(false);
      // Return the updated data so caller can use it immediately
      return updatedData;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, [user, mutateSolved]);

  const getRandomProblems = useCallback(
    (
      tags: ProblemTag[],
      lb: number,
      ub: number,
      customRatings: { P1: number; P2: number; P3: number; P4: number }
    ) => {
      if (!user || !allProblems || !solvedProblems) {
        return;
      }

      setIsLoading(true);

      const ratings = [
        customRatings.P1,
        customRatings.P2,
        customRatings.P3,
        customRatings.P4,
      ];

      const solvedProblemIds = new Set(
        solvedProblems.map((p) => `${p.contestId}_${p.index}`)
      );

      const unsolvedProblems = allProblems.filter(
        (problem) =>
          !solvedProblemIds.has(`${problem.contestId}_${problem.index}`)
      );

      const problemPools = ratings.map((rating) => ({
        rating,
        solved: solvedProblems.filter((problem) => problem.rating === rating),
        unsolved: unsolvedProblems.filter(
          (problem) => problem.rating === rating
        ),
      }));

      const alreadyChosen = new Set<string>();
      const newProblems = problemPools.map((pool) => {
        let problem = null;

        let newPool = pool;
        if (tags.length > 0) {
          newPool = {
            ...pool,
            solved: pool.solved.filter((problem) =>
              tags.some((tag: ProblemTag) => problem.tags.includes(tag.value))
            ),
            unsolved: pool.unsolved.filter((problem) =>
              tags.some((tag: ProblemTag) => problem.tags.includes(tag.value))
            ),
          };
        }

        const newPool2 = {
          rating: newPool.rating,
          solved: {
            inrange: [] as CodeforcesProblem[],
            outsiderange: [] as CodeforcesProblem[],
          },
          unsolved: {
            inrange: [] as CodeforcesProblem[],
            outsiderange: [] as CodeforcesProblem[],
          },
        };

        newPool2.solved.inrange = newPool.solved.filter((problem) => {
          const id = problem.contestId;
          return id >= lb && id <= ub;
        });
        newPool2.solved.outsiderange = newPool.solved.filter((problem) => {
          const id = problem.contestId;
          return id < lb || id > ub;
        });

        newPool2.unsolved.inrange = newPool.unsolved.filter((problem) => {
          const id = problem.contestId;
          return id >= lb && id <= ub;
        });
        newPool2.unsolved.outsiderange = newPool.unsolved.filter((problem) => {
          const id = problem.contestId;
          return id < lb || id > ub;
        });

        const chooseFrom = (problist: CodeforcesProblem[]) => {
          let tmp = problist[Math.floor(Math.random() * problist.length)];
          let str = `${tmp.contestId}_${tmp.index}`;
          while (alreadyChosen.has(str)) {
            tmp = problist[Math.floor(Math.random() * problist.length)];
            str = `${tmp.contestId}_${tmp.index}`;
          }
          alreadyChosen.add(str);

          return tmp;
        };

        if (newPool.unsolved.length > 0) {
          if (newPool2.unsolved.inrange.length > 0) {
            problem = chooseFrom(newPool2.unsolved.inrange);
          } else {
            problem = chooseFrom(newPool2.unsolved.outsiderange);
          }
        } else {
          if (newPool2.solved.inrange.length > 0) {
            problem = chooseFrom(newPool2.solved.inrange);
          } else {
            problem = chooseFrom(newPool2.solved.outsiderange);
          }
        }
        return {
          ...problem,
          url: `https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`,
          solvedTime: null,
        };
      });

      setIsLoading(false);
      return newProblems;
    },
    [user, allProblems, solvedProblems]
  );

  return {
    allProblems: allProblems ?? [],
    solvedProblems: solvedProblems ?? [],
    isLoading: isLoading || isLoadingAll || isLoadingSolved,
    refreshSolvedProblems,
    getRandomProblems,
  };
};

export default useProblems;
