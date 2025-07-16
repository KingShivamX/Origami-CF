"use client";

import { useState } from "react";
import useUser from "@/hooks/useUser";
import { User } from "@/types/User";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Profile = ({ user, logout }: { user: User; logout: () => void }) => {
  const { resetPin, syncProfile } = useUser();
  const [showReset, setShowReset] = useState(false);
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmNewPin, setConfirmNewPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPin.length !== 4 || oldPin.length !== 4) {
      setError("All PINs must be exactly 4 digits.");
      return;
    }
    if (newPin !== confirmNewPin) {
      setError("New PINs do not match.");
      return;
    }

    setIsLoading(true);
    const response = await resetPin(oldPin, newPin);
    if (response.success) {
      setSuccess("PIN reset successfully!");
      setOldPin("");
      setNewPin("");
      setConfirmNewPin("");
      setShowReset(false);
    } else {
      setError(response.error);
    }
    setIsLoading(false);
  };

  const handleSyncProfile = async () => {
    setIsSyncing(true);
    setError(null);
    setSuccess(null);

    const response = await syncProfile();
    if (response.success) {
      setSuccess("Profile synced successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(response.error);
      setTimeout(() => setError(null), 5000);
    }
    setIsSyncing(false);
  };

  return (
    <div className="w-full">
      <CardHeader className="text-center">
        <div className="flex justify-center">
          <Avatar className="w-24 h-24 mb-4 border-4 border-primary/20">
            <AvatarImage src={user.avatar} alt={user.codeforcesHandle} />
            <AvatarFallback className="bg-muted text-lg font-semibold">
              {user.codeforcesHandle.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <CardTitle className="text-2xl">{user.codeforcesHandle}</CardTitle>
        <CardDescription>
          {user.organization || "No organization"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-center mb-6">
          <div className="bg-muted/50 rounded-lg p-4 border">
            <p className="text-muted-foreground font-medium">Rating</p>
            <p className="text-lg font-bold text-primary">
              {user.rating || 0} ({user.rank || "Unrated"})
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 border">
            <p className="text-muted-foreground font-medium">Max Rating</p>
            <p className="text-lg font-bold text-primary">
              {user.maxRating || 0} ({user.maxRank || "Unrated"})
            </p>
          </div>
        </div>

        <Separator />

        {showReset && (
          <form onSubmit={handleResetPin} className="space-y-6 mt-6">
            <h3 className="text-lg font-medium text-center">Reset PIN</h3>
            <div className="space-y-2">
              <label
                htmlFor="oldPin"
                className="block text-sm font-medium text-center"
              >
                Current PIN
              </label>
              <div className="flex justify-center">
                <InputOTP
                  id="oldPin"
                  maxLength={4}
                  value={oldPin}
                  onChange={setOldPin}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="newPin"
                className="block text-sm font-medium text-center"
              >
                New PIN
              </label>
              <div className="flex justify-center">
                <InputOTP
                  id="newPin"
                  maxLength={4}
                  value={newPin}
                  onChange={setNewPin}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="confirmNewPin"
                className="block text-sm font-medium text-center"
              >
                Confirm New PIN
              </label>
              <div className="flex justify-center">
                <InputOTP
                  id="confirmNewPin"
                  maxLength={4}
                  value={confirmNewPin}
                  onChange={setConfirmNewPin}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
            {success && (
              <p className="text-sm text-green-500 text-center">{success}</p>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowReset(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Resetting..." : "Confirm Reset"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>

      {!showReset && (
        <CardFooter className="flex flex-col md:flex-row gap-2 pt-4">
          <Button
            onClick={handleSyncProfile}
            className="flex-1 bg-[#FCD56F] hover:bg-[#FCD56F]/90 text-black font-medium"
            disabled={isSyncing}
          >
            {isSyncing ? "Syncing..." : "Sync Profile"}
          </Button>
          <Button
            onClick={() => {
              setShowReset(true);
              setError(null);
              setSuccess(null);
            }}
            className="flex-1 bg-[#1A92CF] hover:bg-[#1A92CF]/90 text-white font-medium"
          >
            Reset PIN
          </Button>
          <Button
            onClick={logout}
            className="flex-1 bg-[#B71F25] hover:bg-[#B71F25]/90 text-white font-medium"
          >
            Logout
          </Button>
        </CardFooter>
      )}

      {!showReset && (error || success) && (
        <div className="px-6 pb-4 mt-2">
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
          {success && (
            <p className="text-sm text-green-500 text-center">{success}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
