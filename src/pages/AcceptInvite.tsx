import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';


export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('No invitation token provided.');
      return;
    }

    const acceptInvite = async () => {
      try {
        await api.acceptInvite(token);
        setStatus('success');
        toast({
          title: 'Invitation Accepted',
          description: 'You have successfully joined the organization.',
        });
        
        setTimeout(() => {
          navigate('/dashboard/organizations');
        }, 2000);
      } catch (error) {
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Failed to accept invitation.');
        toast({
          title: 'Error',
          description: 'Failed to accept invitation. The link may be invalid or expired.',
          variant: 'destructive',
        });
      }
    };

    acceptInvite();
  }, [token, navigate, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-xl border border-border shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <SyntropylabsLogo size="lg" />
        </div>

        {status === 'processing' && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <h2 className="text-xl font-semibold">Processing Invitation...</h2>
            <p className="text-muted-foreground">Please wait while we verify your invitation.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold">Welcome Aboard!</h2>
            <p className="text-muted-foreground">You have successfully joined the organization.</p>
            <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold">Invitation Failed</h2>
            <p className="text-red-500">{errorMessage}</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-primary hover:underline mt-4"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
