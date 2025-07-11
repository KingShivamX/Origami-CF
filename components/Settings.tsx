"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import useUser from "@/hooks/useUser";

const Settings = () => {
  const [codeforcesHandle, setCodeforcesHandle] = useState("");
  const [pin, setPin] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { login, register } = useUser();
  const formRef = useRef<HTMLFormElement>(null);

  const handleToggleForm = () => {
    setIsLogin(!isLogin);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (pin.length !== 4) {
      setError("PIN must be exactly 4 digits.");
      setIsLoading(false);
      return;
    }

    try {
      const response = isLogin
        ? await login(codeforcesHandle, pin)
        : await register(codeforcesHandle, pin);

      if (!response.success) {
        setError(response.error || "An unknown error occurred.");
      } else {
        if (!isLogin) {
          setSuccess("Registration successful! You are now logged in.");
        }
        // On successful login, the parent component will re-render and show the profile
      }
    } catch (_err) {
      setError("Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <h2 className="text-2xl font-bold text-center mb-4">
        {isLogin ? "Login" : "Register"}
      </h2>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="codeforcesHandle"
            className="block text-sm font-medium mb-1"
          >
            Codeforces Handle
          </label>
          <Input
            id="codeforcesHandle"
            type="text"
            value={codeforcesHandle}
            onChange={(e) => setCodeforcesHandle(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="pin" className="block text-sm font-medium">
              4-Digit PIN
            </label>
            {isLogin && (
              <Link
                href="/reset-pin"
                className="text-sm text-primary hover:underline"
              >
                Forgot PIN?
              </Link>
            )}
          </div>
          <div className="flex justify-center">
            <InputOTP
              maxLength={4}
              value={pin}
              onChange={setPin}
              onComplete={() => formRef.current?.requestSubmit()}
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
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        {success && (
          <p className="text-sm text-green-500 text-center">{success}</p>
        )}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Loading..." : isLogin ? "Login" : "Register"}
        </Button>
      </form>
      <div className="mt-4 text-center">
        <button onClick={handleToggleForm} className="text-sm text-primary">
          {isLogin
            ? "Don't have an account? Register"
            : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
};

export default Settings;
