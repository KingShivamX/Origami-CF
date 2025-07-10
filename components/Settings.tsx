"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useUser from "@/hooks/useUser";

const Settings = () => {
  const [codeforcesHandle, setCodeforcesHandle] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { login, register } = useUser();

  const handleToggleForm = () => {
    setIsLogin(!isLogin);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = isLogin
        ? await login(codeforcesHandle, password)
        : await register(codeforcesHandle, password);

      if (!response.success) {
        setError(response.error || "An unknown error occurred.");
      } else {
        if (!isLogin) {
          setSuccess("Registration successful! You are now logged in.");
        }
        // On successful login, the parent component will re-render and show the profile
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold">{isLogin ? "Login" : "Register"}</h2>
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <Input
          type="text"
          placeholder="Codeforces Handle"
          value={codeforcesHandle}
          onChange={(e) => setCodeforcesHandle(e.target.value)}
          required
          className="h-12"
        />
        <Input
          type="password"
          placeholder="Password (min. 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="h-12"
        />
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {success && (
          <p className="text-green-500 text-sm text-center">{success}</p>
        )}
        <Button type="submit" disabled={isLoading} className="w-full h-12">
          {isLoading ? "Loading..." : isLogin ? "Login" : "Register"}
        </Button>
      </form>
      <Button variant="link" onClick={handleToggleForm}>
        {isLogin
          ? "Don't have an account? Register"
          : "Already have an account? Login"}
      </Button>
    </div>
  );
};

export default Settings;
