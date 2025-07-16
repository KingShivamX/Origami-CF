"use client";

import Profile from "@/components/Profile";
import Settings from "@/components/Settings";
import Loader from "@/components/Loader";
import Error from "@/components/Error";
import useUser from "@/hooks/useUser";
import { Card, CardContent } from "@/components/ui/card";

const Home = () => {
  const { user, isLoading, error, logout } = useUser();

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <Error />;
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="w-full max-w-4xl mx-auto text-center mb-8 sm:mb-12">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight tracking-tight mb-4 sm:mb-6">
          A Better Way to Practice for Codeforces
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Create custom virtual contests, track your progress, and focus on
          specific topics to improve your skills.
        </p>
      </div>

      {/* Auth Card Section */}
      <div className="w-full max-w-md mx-auto">
        <Card className="border-2 border-border/50 shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardContent className="pt-6 flex justify-center">
            {user ? <Profile user={user} logout={logout} /> : <Settings />}
          </CardContent>
        </Card>
      </div>

      {/* Optional spacing for very large screens */}
      <div className="flex-1 min-h-8"></div>
    </div>
  );
};

export default Home;
