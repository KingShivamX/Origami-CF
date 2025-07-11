import { useState, useEffect, useCallback } from "react";
import useSWR from "swr";
import { Training } from "@/types/Training";
import getPerformance from "@/utils/getPerformance";

// Define a custom error type
interface FetchError extends Error {
  info?: any;
  status?: number;
}

const fetcher = async (url: string) => {
  if (typeof window === "undefined") return [];

  const token = sessionStorage.getItem("token");
  if (!token) {
    throw new Error("No token found");
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch trainings");
  }

  return res.json();
};

const useHistory = () => {
  const [isClient, setIsClient] = useState(false);
  const {
    data: history,
    error,
    mutate,
  } = useSWR<Training[]>(isClient ? "/api/trainings" : null, fetcher);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const addTraining = useCallback(
    async (training: Training) => {
      if (!isClient) return;

      const performance = getPerformance(training);
      const newTraining = { ...training, performance };

      const token = sessionStorage.getItem("token");

      try {
        await fetch("/api/trainings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newTraining),
        });
        // Revalidate the SWR cache to show the new training
        mutate();
      } catch (error) {
        console.error(error);
      }
    },
    [isClient, mutate]
  );

  const deleteTraining = useCallback(
    async (trainingId: string) => {
      // Note: The delete endpoint is not implemented in this pass
      // For now, we just remove it from the local state
      mutate(
        (currentHistory = []) =>
          currentHistory.filter((t: any) => t._id !== trainingId),
        false
      );
    },
    [mutate]
  );

  return {
    history: history || [],
    isLoading: (!error && !history) || !isClient,
    error,
    addTraining,
    deleteTraining,
  };
};

export default useHistory;
