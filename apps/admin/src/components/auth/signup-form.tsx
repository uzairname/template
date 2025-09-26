"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { signup, checkUserExists } from "@/lib/login-actions";
import { AuthError, AuthErrorType } from "@/lib/auth-errors";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  
  email: z.email(),
  
  password: z.string()
    .min(1, "Password is required")
    .min(10, "Password must be at least 10 characters")
    .max(128, "Password must be less than 128 characters"),
  
  confirmPassword: z.string()
    .min(1, "Please confirm your password")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type SignupFormData = z.infer<typeof signupSchema>;
type ValidationErrors = Partial<Record<keyof SignupFormData, string>>;

interface SignupFormProps {
  onSuccess?: () => void;
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const [formData, setFormData] = useState<SignupFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<AuthError | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const validateForm = (): boolean => {
    const result = signupSchema.safeParse(formData);
    
    if (result.success) {
      setValidationErrors({});
      return true;
    }

    const errors: ValidationErrors = {};
    result.error.issues.forEach((error) => {
      const field = error.path[0] as keyof SignupFormData;
      if (!errors[field]) {
        errors[field] = error.message;
      }
    });
    
    setValidationErrors(errors);
    return false;
  };

  const handleFieldChange = (field: keyof SignupFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear auth errors when user starts typing
    if (authError) {
      setAuthError(null);
    }
  };

  const handleSubmit = async () => {
    // Always validate and show errors on submit attempt
    setShowValidationErrors(true);
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setAuthError(null);

    try {
      // Check if user already exists
      const userExistsResult = await checkUserExists(formData.email);
      
      if (!userExistsResult.success) {
        setAuthError(userExistsResult.error);
        setLoading(false);
        return;
      }

      if (userExistsResult.data.exists) {
        setAuthError({
          type: AuthErrorType.USER_ALREADY_EXISTS,
          message: "An account with this email already exists. Please sign in instead.",
        });
        setLoading(false);
        return;
      }

      // Proceed with signup
      const result = await signup(formData.email, formData.password, formData.name);

      if (result.success) {
        onSuccess?.();
      } else {
        setAuthError(result.error);
      }
    } catch (error) {
      setAuthError({
        type: AuthErrorType.UNKNOWN_ERROR,
        message: "An unexpected error occurred. Please try again.",
      });
    }

    setLoading(false);
  };

  const isFormValid = () => {
    return formData.name.trim() && 
           formData.email.trim() && 
           formData.password && 
           formData.confirmPassword && 
           formData.password === formData.confirmPassword && 
           Object.keys(validationErrors).length === 0;
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={(e) => handleFieldChange("name", e.target.value)}
          required
        />
        {showValidationErrors && validationErrors.name && (
          <div className="text-sm text-destructive">{validationErrors.name}</div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => handleFieldChange("email", e.target.value)}
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
          onChange={(e) => handleFieldChange("password", e.target.value)}
          required
        />
        {showValidationErrors && validationErrors.password && (
          <div className="text-sm text-destructive">{validationErrors.password}</div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={(e) => handleFieldChange("confirmPassword", e.target.value)}
          required
        />
        {showValidationErrors && validationErrors.confirmPassword && (
          <div className="text-sm text-destructive">{validationErrors.confirmPassword}</div>
        )}
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
        disabled={loading || !isFormValid()}
        className="w-full"
      >
        {loading ? "Creating Account..." : "Create Account"}
      </Button>
    </div>
  );
}