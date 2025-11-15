"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import useUser from "@/hooks/useUser";
import Loader from "@/components/Loader";

const protectedRoutes = ["/contest", "/history", "/upsolve", "/saved"];

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const isProtectedRoute = protectedRoutes.includes(pathname);

  useEffect(() => {
    // Only redirect if loading is complete and there's no user
    if (!isLoading && !user && isProtectedRoute) {
      router.push("/");
    }
  }, [isLoading, user, router, isProtectedRoute]);

  // Show loader while checking authentication
  if (isLoading && isProtectedRoute) {
    return <Loader />;
  }

  // Redirect to home if not authenticated (this should not show because useEffect handles redirect)
  if (!user && isProtectedRoute) {
    return <Loader />;
  }

  return <>{children}</>;
};

export default AuthGuard;
