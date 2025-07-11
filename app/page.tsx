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
    <section className="container grid items-center gap-6 pb-6 pt-2 md:py-4">
      <div className="flex max-w-[980px] flex-col items-start gap-1">
        <h1 className="text-3xl font-bold leading-tight tracking-tight">
          A Better Way to Practice for Codeforces
        </h1>
        <p className="max-w-[700px] text-sm text-muted-foreground">
          Create custom virtual contests, track your progress, and focus on
          specific topics to improve your skills.
        </p>
      </div>
      <div className="flex justify-center py-4">
        <Card className="w-full max-w-lg border-2 border-border/50 shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardContent className="pt-6 flex justify-center">
            {user ? <Profile user={user} logout={logout} /> : <Settings />}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Home;
