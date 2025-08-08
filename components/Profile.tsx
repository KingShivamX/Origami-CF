"use client";

import { User } from "@/types/User";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Profile = ({ user }: { user: User }) => {
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border">
            <AvatarImage src={user.avatar} alt={user.codeforcesHandle} />
            <AvatarFallback>
              {user.codeforcesHandle.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl font-bold">
              {user.codeforcesHandle}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {user.organization || "No organization"}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Rating</p>
            <p className="text-2xl font-bold text-primary">
              {user.rating || 0}
            </p>
            <p className="text-xs text-muted-foreground">
              {user.rank || "Unrated"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Max Rating
            </p>
            <p className="text-2xl font-bold text-primary">
              {user.maxRating || 0}
            </p>
            <p className="text-xs text-muted-foreground">
              {user.maxRank || "Unrated"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Profile;
