import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Mail } from "lucide-react";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
// Use the live public key that matches the backend live secret key
const STRIPE_PUBLIC_KEY = 'pk_live_51RgC3eIyKcXnVVhnECmwj5F5DMLr5Rgw6McwOYtmyict9K9zmiIRARxZHHb7icwlUws0a6VJqx15n30MVz9qCNGY00pT5lD2mU';

console.log('🔍 STRIPE DEBUG - Public Key:', STRIPE_PUBLIC_KEY.substring(0, 20) + '...');
console.log('🔍 STRIPE DEBUG - Key Type:', STRIPE_PUBLIC_KEY.startsWith('pk_live') ? 'LIVE' : 'TEST');
console.log('🔍 STRIPE DEBUG - Full Key Length:', STRIPE_PUBLIC_KEY.length);
console.log('🔍 STRIPE DEBUG - Key Valid Format:', /^pk_(test|live)_/.test(STRIPE_PUBLIC_KEY));

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
console.log('🔍 STRIPE DEBUG - Stripe Promise Created:', !!stripePromise);

interface CheckoutFormProps {
  paymentType: 'founders' | 'trial' | 'monthly';
  onSuccess: () => void;
  onCancel: () => void;
  guestEmail: string;
  guestName: string;
}

const CheckoutForm = ({ paymentType, onSuccess, onCancel, guestEmail, guestName }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Debug Stripe Elements loading
  console.log('🔧 CheckoutForm render:', { hasStripe: !!stripe, hasElements: !!elements });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      console.error('Stripe or Elements not loaded');
      toast({
        title: "Error",
        description: "Payment system not initialized. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    console.log('Processing payment...');

    try {
      // For monthly and trial, we're using SetupIntent
      // For founders, we're using PaymentIntent
      if (paymentType === 'monthly' || paymentType === 'trial') {
        const { error } = await stripe.confirmSetup({
          elements,
          confirmParams: {
            return_url: window.location.origin + '/dashboard?subscription=' + paymentType,
          },
        });

        if (error) {
          toast({
            title: "Setup Failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          // Store payment information for guest checkout
          const paymentData = {
            email: guestEmail,
            name: guestName,
            paymentType: paymentType,
            timestamp: new Date().toISOString()
          };
          sessionStorage.setItem('pendingPayment', JSON.stringify(paymentData));
          
          toast({
            title: "Setup Successful",
            description: paymentType === 'monthly'
              ? "Your monthly subscription is being activated!"
              : "Your 30-day free trial is now active!",
          });
          onSuccess();
        }
      } else {
        // Founders payment (one-time payment)
        const { error } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: window.location.origin + '/dashboard',
          },
        });

        if (error) {
          toast({
            title: "Payment Failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Payment Successful",
            description: "Welcome to Healthy Mama Founders! You now have lifetime access.",
          });
          onSuccess();
        }
      }
    } catch (err) {
      console.error('🚨 PAYMENT SUBMISSION ERROR:', err);
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : null,
        paymentType,
        hasStripe: !!stripe,
        hasElements: !!elements
      });
      
      toast({
        title: "Payment Error",
        description: err instanceof Error ? err.message : "An unexpected error occurred during payment processing",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border border-gray-200 rounded-lg">
        <h3 className="text-sm font-medium mb-4">Payment Information</h3>
        <div className="min-h-[200px] relative">
          <PaymentElement 
            onReady={() => console.log('✅ PaymentElement ready!')}
            onLoadError={(error) => console.error('❌ PaymentElement load error:', error)}
            onLoaderStart={() => console.log('🔄 PaymentElement loading...')}
            options={{
              layout: {
                type: 'tabs',
                defaultCollapsed: false,
              },
              fields: {
                billingDetails: {
                  name: 'auto',
                  email: 'auto'
                }
              }
            }}
          />
          {!stripe && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading payment system...</p>
              </div>
            </div>
          )}
        </div>
        <div className="mt-2 space-y-1">
          <p className="text-xs text-gray-500">Stripe Status: {stripe ? '✅ Loaded' : '❌ Loading...'}</p>
          <p className="text-xs text-gray-500">Elements Status: {elements ? '✅ Loaded' : '❌ Loading...'}</p>
        </div>
      </div>
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={isProcessing}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button 
          type="submit" 
          className="flex-1 bg-purple-600 hover:bg-purple-700"
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            paymentType === 'founders' ? 'Complete Payment ($100)' : 
            paymentType === 'monthly' ? 'Start Monthly Subscription ($20/mo)' :
            'Start 30-Day Free Trial'
          )}
        </Button>
      </div>
    </form>
  );
};

interface CheckoutProps {
  paymentType: 'founders' | 'trial' | 'monthly';
  onSuccess: () => void;
  onCancel: () => void;
}

export default function Checkout({ paymentType, onSuccess, onCancel }: CheckoutProps) {
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const { toast } = useToast();

  console.log('🔍 GUEST CHECKOUT DEBUG:', {
    paymentType,
    isLoading,
    clientSecret: clientSecret ? 'has client secret' : 'no client secret',
    guestEmail,
    guestName
  });

  const createPaymentIntent = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 GUEST CHECKOUT - Creating payment intent:', {
        paymentType,
        guestEmail,
        guestName
      });
      
      if (!guestEmail || !guestName) {
        throw new Error('Guest email and name are required');
      }
        
        if (paymentType === 'founders') {
          // Create payment intent for $100 founders offer
          const data = await apiRequest("/api/create-payment-intent", {
            method: 'POST',
            body: JSON.stringify({
              paymentType: 'founders',
              amount: 100
            })
          });
          console.log('🔍 GUEST CHECKOUT - Payment intent created:', data);
          
          if (!data.clientSecret) {
            throw new Error('No client secret received from server');
          }
          setClientSecret(data.clientSecret);
        } else if (paymentType === 'monthly') {
          // For monthly subscription, we need to collect payment method first
          // Using SetupIntent for initial card collection
          const data = await apiRequest("/api/create-setup-intent", {
            method: 'POST',
            body: JSON.stringify({
              email: guestEmail,
              name: guestName,
              paymentType: 'monthly'
            })
          });
          console.log('🔍 GUEST CHECKOUT - Monthly setup intent created:', data);
          
          if (!data.clientSecret) {
            throw new Error('No client secret received from server');
          }
          setClientSecret(data.clientSecret);
        } else {
          // Create setup intent for 30-day free trial
          const data = await apiRequest("/api/create-setup-intent", {
            method: 'POST',
            body: JSON.stringify({
              email: guestEmail,
              name: guestName,
              paymentType: 'trial'
            })
          });
          console.log('🔍 GUEST CHECKOUT - Trial setup intent created:', data);
        console.log('🔍 STRIPE DEBUG - Backend secret key type:', data.customerId ? 'LIVE (has customer)' : 'TEST (no customer)');
        console.log('🔍 STRIPE DEBUG - Client secret type:', data.clientSecret?.startsWith('seti_') ? 'SetupIntent' : 'PaymentIntent');
          
          if (!data.clientSecret) {
            throw new Error('No client secret received from server');
          }
          setClientSecret(data.clientSecret);
        }
      } catch (error: any) {
        console.error('🔍 GUEST CHECKOUT - Payment initialization error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to initialize payment. Please try again.",
          variant: "destructive",
        });
        onCancel();
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    console.log('🔍 GUEST CHECKOUT - Component initialized, showing guest form immediately');
    // Always start with guest form - no auth checking needed
    setIsLoading(false);
  }, [paymentType]);

  console.log('🔍 GUEST CHECKOUT - Render decision:', {
    isLoading,
    clientSecret: clientSecret ? 'has client secret' : 'no client secret',
    showGuestForm: !isLoading && !clientSecret
  });

  if (isLoading) {
    console.log('🔍 CHECKOUT DEBUG - Rendering loading screen');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-emerald-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Setting up your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-emerald-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {paymentType === 'founders' ? 'Complete Your Founders Purchase' : 
             paymentType === 'monthly' ? 'Start Your Monthly Subscription' :
             'Start Your 30-Day Free Trial'}
          </CardTitle>
          <div className="text-center">
            {paymentType === 'founders' ? (
              <div>
                <div className="text-2xl font-bold text-purple-600">$100</div>
                <div className="text-sm text-gray-600">One-time payment for lifetime access</div>
              </div>
            ) : paymentType === 'monthly' ? (
              <div>
                <div className="text-2xl font-bold text-blue-600">$20/month</div>
                <div className="text-sm text-gray-600">Monthly subscription, cancel anytime</div>
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold text-emerald-600">$0 Today</div>
                <div className="text-sm text-gray-600">30-day free trial, then $20/month</div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!clientSecret && !isLoading ? (
            // Guest user form - collect email and name before creating payment intent
            <div className="space-y-4">
              <div>
                <Label htmlFor="guest-email">Email Address</Label>
                <Input
                  id="guest-email"
                  type="email"
                  placeholder="Enter your email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="guest-name">Full Name</Label>
                <Input
                  id="guest-name"
                  type="text"
                  placeholder="Enter your name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={async () => {
                    if (!guestEmail || !guestName) {
                      toast({
                        title: "Missing Information",
                        description: "Please enter your email and name to continue.",
                        variant: "destructive",
                      });
                      return;
                    }
                    // Set loading state and create payment intent with guest info
                    setIsLoading(true);
                    await createPaymentIntent();
                  }}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  disabled={isLoading || !guestEmail || !guestName}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    'Continue to Payment'
                  )}
                </Button>
              </div>
            </div>
          ) : clientSecret ? (
            <div>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm 
                  paymentType={paymentType} 
                  onSuccess={onSuccess} 
                  onCancel={onCancel}
                  guestEmail={guestEmail}
                  guestName={guestName}
                />
              </Elements>
            </div>
          ) : (
            <div className="text-center p-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-600">Initializing payment...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}