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
    <div className="flex flex-col items-center justify-center p-4 min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-lg">
        <CardContent className="pt-6">
          {user ? <Profile user={user} logout={logout} /> : <Settings />}
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
