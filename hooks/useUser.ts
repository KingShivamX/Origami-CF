import { useEffect } from "react";
import useSWR, { useSWRConfig } from "swr";
import { User } from "@/types/User";
import { SuccessResponse, ErrorResponse, Response } from "@/types/Response";

const USER_CACHE_KEY = "codeforces-user";

const useUser = () => {
  const {
    data: user,
    isLoading,
    mutate,
    error,
  } = useSWR<User | null>(
    USER_CACHE_KEY,
    null, // We will manage fetching manually or from session
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  useEffect(() => {
    // Attempt to load user from session storage on initial load
    const token = sessionStorage.getItem("token");
    const storedUser = sessionStorage.getItem("user");
    if (token && storedUser) {
      mutate(JSON.parse(storedUser), false);
    }
  }, [mutate]);

  const register = async (
    codeforcesHandle: string,
    password: string
  ): Promise<Response<null>> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codeforcesHandle, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return ErrorResponse(data.message);
      }
      return SuccessResponse(data.message);
    } catch (error) {
      return ErrorResponse("Failed to connect to the server.");
    }
  };

  const login = async (
    codeforcesHandle: string,
    password: string
  ): Promise<Response<User>> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codeforcesHandle, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return ErrorResponse(data.message);
      }

      // Save token and user to session storage
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));

      await mutate(data.user, false);
      return SuccessResponse(data.user);
    } catch (error) {
      return ErrorResponse("Failed to connect to the server.");
    }
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    mutate(null, false);
  };

  return {
    user,
    isLoading,
    error,
    register,
    login,
    logout,
  };
};

export default useUser;
