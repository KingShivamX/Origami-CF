"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { KeyRound } from "lucide-react";
import useUser from "@/hooks/useUser";

const ChangePinDialog = () => {
  const [open, setOpen] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmNewPin, setConfirmNewPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { resetPin } = useUser();

  const handleReset = () => {
    setCurrentPin("");
    setNewPin("");
    setConfirmNewPin("");
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (currentPin.length !== 4) {
      setError("Current PIN must be 4 digits.");
      return;
    }

    if (newPin.length !== 4) {
      setError("New PIN must be 4 digits.");
      return;
    }

    if (newPin !== confirmNewPin) {
      setError("New PINs do not match.");
      return;
    }

    if (currentPin === newPin) {
      setError("New PIN must be different from current PIN.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await resetPin(currentPin, newPin);
      if (response.success) {
        setSuccess("PIN changed successfully!");
        setTimeout(() => {
          setOpen(false);
          handleReset();
        }, 1500);
      } else {
        setError(response.error || "Failed to change PIN.");
      }
    } catch (error) {
      setError("Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    handleReset();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="w-full text-sm">
          <KeyRound className="mr-2 h-4 w-4" />
          Reset PIN
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-auto">
        <SheetHeader>
          <SheetTitle>Change PIN</SheetTitle>
          <SheetDescription>
            Enter your current PIN and choose a new 4-digit PIN.
          </SheetDescription>
        </SheetHeader>
        <div className="mx-auto max-w-md">
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-center">
                Current PIN
              </label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={4}
                  value={currentPin}
                  onChange={setCurrentPin}
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
              <label className="block text-sm font-medium text-center">
                New PIN
              </label>
              <div className="flex justify-center">
                <InputOTP maxLength={4} value={newPin} onChange={setNewPin}>
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
              <label className="block text-sm font-medium text-center">
                Confirm New PIN
              </label>
              <div className="flex justify-center">
                <InputOTP
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

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Changing..." : "Confirm Reset"}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ChangePinDialog;
