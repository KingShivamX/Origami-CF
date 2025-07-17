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
      <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-primary">
        Origami-CF
      </h1>
      <p className="text-lg text-muted-foreground mb-8">
        A better way to practice for Codeforces.
      </p>
      {/* Auth Card Section */}
      <div className="w-full max-w-md mx-auto">
        <Card className="border-2 border-border/50 shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardContent className="pt-6 flex justify-center">
            {user ? <Profile user={user} logout={logout} /> : <Settings />}
          </CardContent>
        </Card>
      </div>
      <div className="flex-1 min-h-8"></div>
    </div>
  );
};

export default Home;
