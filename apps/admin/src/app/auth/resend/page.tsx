'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/card';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { ErrorLayout } from '@/components/ui/error-layout';

export default function ResendConfirmationPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setStatus('error');
      setMessage('Please enter your email address.');
      return;
    }

    setLoading(true);
    setStatus('idle');
    
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        setStatus('error');
        setMessage(error.message || 'Failed to send confirmation email.');
      } else {
        setStatus('success');
        setMessage('Confirmation email sent! Please check your inbox and spam folder.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorLayout>
      <Card className="w-full max-w-md">
        <CardHeader>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="w-fit mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex justify-center mb-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          
          <CardTitle className="text-xl text-center">
            Resend Confirmation
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email address and we'll send you a new confirmation link.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleResend} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || status === 'success'}
                required
              />
            </div>

            {message && (
              <div className={`flex items-start space-x-3 p-3 rounded-lg ${
                status === 'success' 
                  ? 'bg-accent border border-border' 
                  : 'bg-destructive/10 border border-destructive/20'
              }`}>
                {status === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                )}
                <p className={`text-sm ${
                  status === 'success' ? 'text-primary' : 'text-destructive'
                }`}>
                  {message}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Button
                type="submit"
                disabled={loading || !email || status === 'success'}
                className="w-full"
              >
                {loading ? 'Sending...' : 'Send Confirmation Email'}
              </Button>
              
              {status !== 'success' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="w-full"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
          
          {status === 'success' && (
            <div className="mt-4">
              <Button
                onClick={() => router.push('/')}
                className="w-full"
              >
                Continue to App
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </ErrorLayout>
  );
}