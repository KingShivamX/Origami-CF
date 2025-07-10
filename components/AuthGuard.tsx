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
    if (!isLoading && !user && isProtectedRoute) {
      router.push("/");
    }
  }, [isLoading, user, router, isProtectedRoute]);

  if (isLoading && isProtectedRoute) {
    return <Loader />;
  }

  if (!user && isProtectedRoute) {
    return null; // or a loader, while redirecting
  }

  return <>{children}</>;
};

export default AuthGuard;
