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
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutFormProps {
  paymentType: 'founders' | 'trial';
  onSuccess: () => void;
  onCancel: () => void;
}

const CheckoutForm = ({ paymentType, onSuccess, onCancel }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
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
          description: paymentType === 'founders' 
            ? "Welcome to Healthy Mama Founders! You now have lifetime access." 
            : "Your 21-day premium trial is now active!",
        });
        onSuccess();
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
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
            paymentType === 'founders' ? 'Complete Payment ($99)' : 'Start 21-Day Trial'
          )}
        </Button>
      </div>
    </form>
  );
};

interface CheckoutProps {
  paymentType: 'founders' | 'trial';
  onSuccess: () => void;
  onCancel: () => void;
}

export default function Checkout({ paymentType, onSuccess, onCancel }: CheckoutProps) {
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        setIsLoading(true);
        
        if (paymentType === 'founders') {
          // Create payment intent for $99 founders offer
          const data = await apiRequest("/api/create-payment-intent", {
            method: 'POST',
            body: JSON.stringify({
              paymentType: 'founders',
              amount: 99
            })
          });
          setClientSecret(data.clientSecret);
        } else {
          // Create setup intent for 21-day trial
          const data = await apiRequest("/api/create-trial-subscription", {
            method: 'POST',
            body: JSON.stringify({
              email: "user@example.com", // This would come from user input
              name: "User Name"
            })
          });
          setClientSecret(data.clientSecret);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to initialize payment. Please try again.",
          variant: "destructive",
        });
        onCancel();
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [paymentType, onCancel, toast]);

  if (isLoading || !clientSecret) {
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
            {paymentType === 'founders' ? 'Complete Your Founders Purchase' : 'Set Up Your 21-Day Trial'}
          </CardTitle>
          <div className="text-center">
            {paymentType === 'founders' ? (
              <div>
                <div className="text-2xl font-bold text-purple-600">$99</div>
                <div className="text-sm text-gray-600">One-time payment for lifetime access</div>
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold text-emerald-600">$0 Today</div>
                <div className="text-sm text-gray-600">21-day premium trial</div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm 
              paymentType={paymentType} 
              onSuccess={onSuccess} 
              onCancel={onCancel} 
            />
          </Elements>
        </CardContent>
      </Card>
    </div>
  );
}