import { useEffect } from "react";
import useSWR from "swr";
import { Training } from "@/types/Training";
import getPerformance from "@/utils/getPerformance";

// Define a custom error type
interface FetchError extends Error {
  info?: any;
  status?: number;
}

const fetcher = async (url: string) => {
  const token = sessionStorage.getItem("token");
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error: FetchError = new Error(
      "An error occurred while fetching the data."
    );
    // Attach extra info to the error object.
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }

  return res.json();
};

const useHistory = () => {
  const {
    data: history,
    error,
    mutate,
  } = useSWR<Training[]>("/api/trainings", fetcher);

  const addTraining = async (training: Training) => {
    const performance = getPerformance(training);
    const newTraining = { ...training, performance };

    const token = sessionStorage.getItem("token");

    try {
      const res = await fetch("/api/trainings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTraining),
      });

      if (!res.ok) {
        throw new Error("Failed to save training");
      }

      // Revalidate the SWR cache to show the new training
      mutate();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteTraining = async (trainingId: string) => {
    // Note: The delete endpoint is not implemented in this pass
    // For now, we just remove it from the local state
    mutate(
      history?.filter((t) => (t as any)._id !== trainingId),
      false
    );
  };

  return {
    history: history || [],
    isLoading: !error && !history,
    error,
    addTraining,
    deleteTraining,
  };
};

export default useHistory;
