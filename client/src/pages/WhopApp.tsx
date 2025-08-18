import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function WhopApp() {
  const [, setLocation] = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInWhopIframe, setIsInWhopIframe] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    // Check if we're in a Whop iframe
    const inIframe = window.self !== window.top;
    setIsInWhopIframe(inIframe);
    
    // Get URL parameters (Whop passes user info in URL)
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user_id');
    const accessPass = urlParams.get('access_pass');
    const email = urlParams.get('email');
    
    // If we have Whop parameters, validate them
    if (userId) {
      validateWhopSession(userId, accessPass, email);
    } else if (inIframe) {
      // We're in iframe but no params - wait for postMessage
      setupWhopListener();
    } else {
      // Not in Whop context
      setError('Please access this app through your Whop dashboard');
      setIsValidating(false);
    }
  }, []);

  const setupWhopListener = () => {
    // Listen for messages from Whop parent frame
    const handleMessage = async (event: MessageEvent) => {
      // Verify origin is from Whop
      if (event.origin !== 'https://whop.com' && !event.origin.includes('whop.com')) {
        return;
      }

      if (event.data.type === 'whop_auth' || event.data.user_id) {
        const { user_id, access_pass, email } = event.data;
        await validateWhopSession(user_id, access_pass, email);
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Request auth info from parent
    if (window.parent) {
      window.parent.postMessage({ type: 'request_auth' }, '*');
    }

    // Cleanup
    return () => window.removeEventListener('message', handleMessage);
  };

  const validateWhopSession = async (userId: string, accessPass?: string | null, email?: string | null) => {
    try {
      setIsValidating(true);
      
      const response = await fetch('/api/whop/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          user_id: userId,
          access_pass: accessPass,
          email: email,
        }),
      });

      const data = await response.json();

      if (data.success && data.has_access) {
        // Store the app token for future requests
        localStorage.setItem('token', data.token);
        localStorage.setItem('whop_user_id', userId);
        
        // Log the user in
        if (data.user && data.user.email) {
          await login(data.user.email, '', data.token);
        }
        
        setHasAccess(true);
        setIsValidating(false);
        
        // Auto-redirect to main app after successful auth
        setTimeout(() => {
          setLocation('/meal-planner');
        }, 1500);
      } else {
        setError('No active Whop membership found');
        setHasAccess(false);
        setIsValidating(false);
      }
    } catch (err) {
      console.error('Validation error:', err);
      setError('Failed to validate membership');
      setIsValidating(false);
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const handleDirectAccess = () => {
    // For users who want to use the app directly
    setLocation('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            NutriMa AI Meal Planner
          </CardTitle>
          <CardDescription className="text-center">
            {isInWhopIframe ? 'Whop App Integration' : 'Premium Meal Planning'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isValidating && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-gray-600">Validating your Whop membership...</p>
            </div>
          )}

          {!isValidating && hasAccess && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <h3 className="text-lg font-semibold">Access Granted!</h3>
              <p className="text-gray-600 text-center">
                Welcome to NutriMa! Redirecting to your meal planner...
              </p>
              <Button onClick={() => setLocation('/meal-planner')} className="w-full">
                Start Planning Meals
              </Button>
            </div>
          )}

          {!isValidating && error && (
            <div className="flex flex-col items-center space-y-4 py-8">
              {isInWhopIframe ? (
                <XCircle className="h-12 w-12 text-red-500" />
              ) : (
                <AlertCircle className="h-12 w-12 text-yellow-500" />
              )}
              <h3 className="text-lg font-semibold">
                {isInWhopIframe ? 'Access Denied' : 'Direct Access'}
              </h3>
              <p className="text-gray-600 text-center">{error}</p>
              <div className="flex gap-2 w-full">
                {isInWhopIframe ? (
                  <>
                    <Button onClick={handleRetry} variant="outline" className="flex-1">
                      Retry
                    </Button>
                    <Button 
                      onClick={() => window.open('https://whop.com/nutrima/', '_blank')} 
                      className="flex-1"
                    >
                      Get Access
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={handleDirectAccess} variant="outline" className="flex-1">
                      Use App Directly
                    </Button>
                    <Button 
                      onClick={() => window.open('https://whop.com/nutrima/', '_blank')} 
                      className="flex-1"
                    >
                      Get Whop Access
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">What's Included:</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>✓ AI-powered personalized meal plans</li>
              <li>✓ 50+ cuisine options</li>
              <li>✓ Smart grocery lists</li>
              <li>✓ Nutrition tracking</li>
              <li>✓ Family meal planning</li>
              <li>✓ Direct Instacart integration</li>
            </ul>
          </div>

          {!isInWhopIframe && (
            <div className="text-xs text-center text-gray-500 pt-2">
              For full Whop integration, access this app through your Whop dashboard
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}