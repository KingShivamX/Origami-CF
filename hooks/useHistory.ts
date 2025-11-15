import { useState, useEffect, useCallback } from "react";
import useSWR from "swr";
import { Training } from "@/types/Training";
import { getAccuratePerformance } from "@/utils/getPerformance";
import useUser from "@/hooks/useUser";

// Define a custom error type
interface FetchError extends Error {
  info?: any;
  status?: number;
}

const fetcher = async (url: string) => {
  if (typeof window === "undefined") return [];

  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No token found");
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    // Token expired, clear localStorage and reload page
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
    throw new Error("Authentication expired");
  }

  if (!res.ok) {
    throw new Error("Failed to fetch trainings");
  }

  return res.json();
};

const useHistory = () => {
  const [isClient, setIsClient] = useState(false);
  const { user } = useUser();
  const {
    data: history,
    error,
    mutate,
  } = useSWR<Training[]>(isClient ? "/api/contests" : null, fetcher);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const addTraining = useCallback(
    async (training: Training) => {
      if (!isClient) return null;

      // Use the user's current rating for accurate performance calculation
      const userRating = user?.rating || 1500; // Default to 1500 if rating not available
      const performance = getAccuratePerformance(training, userRating);
      const newTraining = { ...training, performance };

      const token = localStorage.getItem("token");

      try {
        const response = await fetch("/api/contests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newTraining),
        });

        if (response.status === 401) {
          // Token expired, clear localStorage and reload page
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.reload();
          return null;
        }

        if (!response.ok) {
          throw new Error("Failed to save training");
        }

        const data = await response.json();
        
        // Revalidate the SWR cache to show the new training
        mutate();
        
        // Return rating change data for display
        return data.ratingChange || null;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    [isClient, mutate, user?.rating]
  );

  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const deleteTraining = useCallback(
    async (trainingId: string) => {
      if (isDeleting) return;

      setIsDeleting(trainingId);

      // Optimistic update
      mutate(
        (currentData = []) =>
          currentData.filter((training) => training._id !== trainingId),
        false
      );

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/contests/${trainingId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          // Token expired, clear localStorage and reload page
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.reload();
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to delete training");
        }
      } catch (error) {
        console.error("Error deleting training:", error);
        // Rollback on error
        mutate();
      } finally {
        setIsDeleting(null);
      }
    },
    [mutate, isDeleting]
  );

  return {
    history: history || [],
    isLoading: (!error && !history) || !isClient,
    error,
    addTraining,
    deleteTraining,
    isDeleting,
  };
};

export default useHistory;
