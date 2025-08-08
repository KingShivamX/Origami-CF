"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ResetPinPage() {
  const router = useRouter();
  const [stage, setStage] = useState<"enterHandle" | "verify" | "resetPin">(
    "enterHandle"
  );
  const [handle, setHandle] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmNewPin, setConfirmNewPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(120);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (stage === "verify" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setError("Verification time expired. Please try again.");
      setStage("enterHandle");
    }
    return () => clearInterval(timer);
  }, [stage, countdown]);

  const handleStartVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle) {
      setError("Please enter your Codeforces handle.");
      return;
    }
    setIsLoading(true);
    setError(null);

    const res = await fetch("/api/auth/initiate-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle }),
    });

    const data = await res.json();
    if (res.ok) {
      setVerificationToken(data.verificationToken);
      setStage("verify");
      setCountdown(120); // Reset countdown
    } else {
      setError(data.message || "Failed to start verification.");
    }
    setIsLoading(false);
  };

  const handleVerify = async () => {
    setIsLoading(true);
    setError(null);

    const res = await fetch("/api/auth/verify-submission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verificationToken }),
    });

    const data = await res.json();
    if (res.ok) {
      setResetToken(data.resetToken);
      setStage("resetPin");
    } else {
      setError(data.message || "Verification failed.");
    }
    setIsLoading(false);
  };

  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4) {
      setError("New PIN must be 4 digits.");
      return;
    }
    if (newPin !== confirmNewPin) {
      setError("New PINs do not match.");
      return;
    }
    setIsLoading(true);
    setError(null);

    const res = await fetch("/api/auth/reset-pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resetToken, newPin }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("PIN reset successfully! You can now log in with your new PIN.");
      router.push("/");
    } else {
      setError(data.message || "Failed to reset PIN.");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex justify-center items-start pt-12 md:pt-24 pb-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Reset Your PIN</CardTitle>
        </CardHeader>
        <CardContent>
          {stage === "enterHandle" && (
            <form onSubmit={handleStartVerification} className="space-y-4">
              <CardDescription>
                Enter your Codeforces handle to start the PIN reset process.
              </CardDescription>
              <div>
                <label htmlFor="handle" className="sr-only">
                  Codeforces Handle
                </label>
                <Input
                  id="handle"
                  type="text"
                  placeholder="Codeforces Handle"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Starting..." : "Start Verification"}
              </Button>
            </form>
          )}

          {stage === "verify" && (
            <div className="space-y-4 text-center">
              <CardDescription>
                Go to{" "}
                <a
                  href="https://codeforces.com/problemset/problem/4/A"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Codeforces Problem 4A
                </a>{" "}
                and make a submission that results in a **compilation error**.
              </CardDescription>
              <div className="text-6xl font-bold">{countdown}</div>
              <p>Time remaining to submit</p>
              <Button
                onClick={handleVerify}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "I have submitted, Verify Now"}
              </Button>
            </div>
          )}

          {stage === "resetPin" && (
            <form onSubmit={handleResetPin} className="space-y-6">
              <CardDescription className="text-center">
                Verification successful! You can now set a new PIN.
              </CardDescription>
              <div className="space-y-2">
                <label
                  htmlFor="newPin"
                  className="block text-sm font-medium text-center"
                >
                  New 4-Digit PIN
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
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Resetting..." : "Reset PIN"}
              </Button>
            </form>
          )}

          {error && (
            <p className="text-sm text-red-500 mt-4 text-center">{error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
