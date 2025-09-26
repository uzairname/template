"use client";

import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card";
import { AlertCircle } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";

export interface AuthErrorAction {
  label: string;
  action: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export interface AuthErrorDetails {
  title: string;
  description: string;
  details?: string;
  icon: React.ReactNode;
  actions: AuthErrorAction[];
  showHelpSection?: boolean;
}

interface AuthErrorCardProps {
  errorDetails: AuthErrorDetails;
  className?: string;
}

export function AuthErrorCard({ errorDetails, className }: AuthErrorCardProps) {
  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          {errorDetails.icon}
        </div>
        <CardTitle className="text-xl">{errorDetails.title}</CardTitle>
        <CardDescription className="text-base">
          {errorDetails.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        
        <div className="space-y-2">
          {errorDetails.actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.action}
              variant={action.variant || "default"}
              className="w-full"
            >
              {action.label}
            </Button>
          ))}
        </div>
        
      </CardContent>
    </Card>
  );
}

// Helper function to create auth error details
export function createAuthErrorDetails({
  reason,
  errorMessage,
  missing,
  onRequestNew,
  onGoHome,
  onTryAgain,
  onTrySignIn,
}: {
  reason: string | null;
  errorMessage?: string | null;
  missing?: string | null;
  onRequestNew: () => void;
  onGoHome: () => void;
  onTryAgain: () => void;
  onTrySignIn: () => void;
}): AuthErrorDetails {
  switch (reason) {
    case 'missing_params':
      return {
        title: 'Invalid Confirmation Link',
        description: 'The confirmation link appears to be incomplete or corrupted.',
        details: `Missing parameters: ${missing}`,
        icon: <AlertCircle className="h-8 w-8 text-muted-foreground" />,
        actions: [
          {
            label: 'Request New Link',
            action: onRequestNew,
            variant: 'default',
          },
          {
            label: 'Go Home',
            action: onGoHome,
            variant: 'outline',
          },
        ],
      };
      
    case 'verification_failed':
      const isExpired = errorMessage?.toLowerCase().includes('expired') || 
                       errorMessage?.toLowerCase().includes('invalid');
      
      return {
        title: isExpired ? 'Confirmation Link Expired' : 'Verification Failed',
        description: isExpired 
          ? 'This confirmation link has expired or has already been used.'
          : 'We were unable to verify your account with this link.',
        details: errorMessage || 'Unknown verification error occurred.',
        icon: <AlertCircle className="h-8 w-8 text-destructive" />,
        actions: [
          {
            label: 'Request New Confirmation',
            action: onRequestNew,
            variant: 'default',
          },
          {
            label: 'Try Signing In',
            action: onTrySignIn,
            variant: 'outline',
          },
        ],
        showHelpSection: true,
      };
      
    default:
      return {
        title: 'Authentication Error',
        description: 'Something went wrong during the authentication process.',
        details: errorMessage || 'An unknown error occurred.',
        icon: <AlertCircle className="h-8 w-8 text-destructive" />,
        actions: [
          {
            label: 'Try Again',
            action: onTryAgain,
            variant: 'default',
          },
          {
            label: 'Go Home',
            action: onGoHome,
            variant: 'outline',
          },
        ],
      };
  }
}