"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import useUser from "@/hooks/useUser";
import Loader from "@/components/Loader";

const protectedRoutes = ["/training", "/statistics", "/upsolve"];

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const isProtectedRoute = protectedRoutes.includes(pathname);

  useEffect(() => {
    // Add a small delay to ensure localStorage is properly loaded
    const timer = setTimeout(() => {
      if (!isLoading && !user && isProtectedRoute) {
        router.push("/");
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isLoading, user, router, isProtectedRoute]);

  // Show loader while checking authentication
  if (isLoading && isProtectedRoute) {
    return <Loader />;
  }

  // Show loader while waiting for user data to load from localStorage
  if (!user && isProtectedRoute) {
    return <Loader />;
  }

  return <>{children}</>;
};

export default AuthGuard;
