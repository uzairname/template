"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { login, resetPassword } from "@/lib/login-actions";
import { AuthError } from "@/lib/auth-errors";
import { z } from "zod";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type ValidationErrors = Partial<Record<keyof LoginFormData, string>>;

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [authError, setAuthError] = useState<AuthError | null>(null);

  const isValidEmail = useMemo(() => {
    return z.email().safeParse(formData.email).success;
  }, [formData.email]);

  const validateForm = (): boolean => {
    const result = loginSchema.safeParse(formData);
    
    if (result.success) {
      setValidationErrors({});
      return true;
    }

    const errors: ValidationErrors = {};
    result.error.issues.forEach((error) => {
      const field = error.path[0] as keyof LoginFormData;
      if (!errors[field]) {
        errors[field] = error.message;
      }
    });
    
    setValidationErrors(errors);
    return false;
  };

  const setFormField = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setAuthError(null);
    setForgotPasswordSuccess(false);
  }

  const handleSubmit = async () => {
    // Validate and show errors on submit attempt
    setShowValidationErrors(true);
    
    // Do nothing if form is invalid
    if (!validateForm()) return;

    setLoading(true);
    setAuthError(null);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      onSuccess?.();
    } else {
      setAuthError(result.error);
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    // Only require email for password reset
    if (!isValidEmail) {
      setValidationErrors({ email: "Please enter a valid email address" });
      setShowValidationErrors(true);
      return;
    }

    setForgotPasswordLoading(true);
    setAuthError(null);
    setValidationErrors({});

    const result = await resetPassword(formData.email);

    if (result.success) {
      setForgotPasswordSuccess(true);
    } else {
      setAuthError(result.error);
    }
    setForgotPasswordLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => setFormField("email", e.target.value)}
          required
        />
        {showValidationErrors && validationErrors.email && (
          <div className="text-sm text-destructive">{validationErrors.email}</div>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={(e) => setFormField("password", e.target.value)}
          required
        />
        {showValidationErrors && validationErrors.password && (
          <div className="text-sm text-destructive">{validationErrors.password}</div>
        )}
      </div>

      {forgotPasswordSuccess && (
        <div className="space-y-3">
          <div className="text-sm text-green-600">
            Password reset instructions have been sent to your email.
          </div>
        </div>
      )}

      {authError && (
        <div className="space-y-3">
          <div className="text-sm text-destructive">
            {authError.message}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !isValidEmail || !formData.password}
          className="w-full"
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          onClick={handleForgotPassword}
          disabled={forgotPasswordLoading || !isValidEmail}
          className="w-full text-sm"
        >
          {forgotPasswordLoading ? "Sending reset email..." : "Forgot your password?"}
        </Button>
      </div>
    </div>
  );
}