import { useEffect, useState, useCallback } from "react";
import useSWR, { useSWRConfig } from "swr";
import { User } from "@/types/User";
import { SuccessResponse, ErrorResponse, Response } from "@/types/Response";

const USER_CACHE_KEY = "codeforces-user";

const useUser = () => {
  const [isClient, setIsClient] = useState(false);
  const {
    data: user,
    isLoading,
    mutate,
    error,
  } = useSWR<User | null>(
    USER_CACHE_KEY,
    null, // We will manage fetching manually or from localStorage
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Add token validation function
  const validateToken = useCallback(async (token: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/validate-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    // Only attempt to load user from localStorage after client hydration
    if (!isClient) return;

    const loadUser = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      
      if (token && storedUser) {
        // Validate token before loading user
        const isValidToken = await validateToken(token);
        
        if (isValidToken) {
          mutate(JSON.parse(storedUser), false);
        } else {
          // Token expired, clear localStorage and logout
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          mutate(null, false);
        }
      } else {
        // If no stored user, mark loading as complete
        mutate(null, false);
      }
    };

    loadUser();
  }, [mutate, isClient, validateToken]);

  const register = useCallback(
    async (codeforcesHandle: string, pin: string): Promise<Response<User>> => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ codeforcesHandle, pin }),
        });
        const data = await res.json();
        if (!res.ok) {
          return ErrorResponse(data.message);
        }
        // After successful registration, automatically log the user in
        return await login(codeforcesHandle, pin);
      } catch (error) {
        return ErrorResponse("Failed to connect to the server.");
      }
    },
    []
  );

  const login = useCallback(
    async (codeforcesHandle: string, pin: string): Promise<Response<User>> => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ codeforcesHandle, pin }),
        });
        const data = await res.json();
        if (!res.ok) {
          return ErrorResponse(data.message);
        }

        // Save token and user to localStorage for persistent sessions
        if (isClient) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        await mutate(data.user, false);
        return SuccessResponse(data.user);
      } catch (error) {
        return ErrorResponse("Failed to connect to the server.");
      }
    },
    [isClient, mutate]
  );

  const logout = () => {
    if (isClient) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    mutate(null, false);
  };

  const resetPin = async (
    oldPin: string,
    newPin: string
  ): Promise<Response<null>> => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/reset-pin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPin, newPin }),
      });

      if (res.status === 401) {
        // Token expired, clear localStorage and reload page
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.reload();
        return ErrorResponse("Authentication expired");
      }

      const data = await res.json();
      if (!res.ok) {
        return ErrorResponse(data.message);
      }

      return SuccessResponse(null);
    } catch (error) {
      return ErrorResponse("Failed to connect to the server.");
    }
  };

  const syncProfile = useCallback(async (): Promise<Response<User>> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return ErrorResponse("Not authenticated");
      }

      const res = await fetch("/api/auth/sync-profile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        // Token expired, clear localStorage and reload page
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.reload();
        return ErrorResponse("Authentication expired");
      }

      const data = await res.json();
      if (!res.ok) {
        return ErrorResponse(data.message);
      }

      // Update localStorage with new user data
      if (isClient && data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        await mutate(data.user, false);
      }

      return SuccessResponse(data.user);
    } catch (error) {
      return ErrorResponse("Failed to sync profile");
    }
  }, [isClient, mutate]);

  return {
    user,
    isLoading: isLoading || !isClient,
    error,
    register,
    login,
    logout,
    resetPin,
    syncProfile,
  };
};

export default useUser;
