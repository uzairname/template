"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { login } from "@/lib/login-actions";
import { AuthError } from "@/lib/auth-errors";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<AuthError | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setAuthError(null);

    const result = await login(email, password);

    if (result.success) {
      onSuccess?.();
    } else {
      setAuthError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {authError && (
        <div className="space-y-3">
          <div className="text-sm text-destructive">
            {authError.message}
          </div>
        </div>
      )}

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={loading || !email || !password}
        className="w-full"
      >
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </div>
  );
}