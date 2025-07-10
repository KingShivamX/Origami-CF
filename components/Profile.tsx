"use client";

import { User } from "@/types/User";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const Profile = ({ user, logout }: { user: User; logout: () => void }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <Avatar className="w-40 h-40 border-4 border-primary shadow-lg">
        <AvatarImage src={user?.avatar || "/default-avatar.jpg"} alt="avatar" />
        <AvatarFallback>
          {user?.codeforcesHandle?.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-center justify-center gap-2 w-full">
        <h2 className="text-3xl font-bold">{user?.codeforcesHandle}</h2>
        <p className="text-xl text-muted-foreground">{user?.rank}</p>

        <Separator className="my-4" />

        <div className="grid grid-cols-2 gap-x-8 gap-y-4 w-full text-sm">
          <div className="flex flex-col items-center">
            <span className="font-semibold text-muted-foreground">Rating</span>
            <span className="font-bold text-lg">{user?.rating || "N/A"}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-semibold text-muted-foreground">
              Max Rating
            </span>
            <span className="font-bold text-lg">
              {user?.maxRating || "N/A"} ({user?.maxRank || "N/A"})
            </span>
          </div>
          <div className="col-span-2 flex flex-col items-center">
            <span className="font-semibold text-muted-foreground">
              Organization
            </span>
            <span className="font-bold text-lg text-center">
              {user?.organization || "N/A"}
            </span>
          </div>
        </div>

        <Button
          onClick={logout}
          variant="outline"
          className="mt-6 w-full max-w-xs"
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Profile;
