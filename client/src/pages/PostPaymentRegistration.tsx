import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Eye, EyeOff, CheckCircle, Mail, User } from "lucide-react";
import { useLocation } from "wouter";

interface PaymentData {
  email: string;
  name: string;
  paymentType: 'founders' | 'trial' | 'monthly';
  customerId?: string;
  timestamp: string;
}

export default function PostPaymentRegistration() {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const { toast } = useToast();

  // Get payment data from URL parameters or sessionStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectStatus = urlParams.get('redirect_status');
    const paymentIntent = urlParams.get('payment_intent');
    const setupIntent = urlParams.get('setup_intent');
    
    // Check for successful payment/setup
    if (redirectStatus === 'succeeded') {
      // Get stored payment data from sessionStorage
      const storedPaymentData = sessionStorage.getItem('pendingPayment');
      if (storedPaymentData) {
        try {
          const data = JSON.parse(storedPaymentData);
          setPaymentData(data);
          console.log('🔍 Payment data loaded:', data);
        } catch (error) {
          console.error('Failed to parse payment data:', error);
          toast({
            title: "Error",
            description: "Payment data not found. Please contact support.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "Payment completed but account data is missing. Please contact support.",
          variant: "destructive",
        });
      }
    } else {
      // If no successful payment redirect, check sessionStorage anyway
      const storedPaymentData = sessionStorage.getItem('pendingPayment');
      if (storedPaymentData) {
        try {
          const data = JSON.parse(storedPaymentData);
          setPaymentData(data);
        } catch (error) {
          console.error('Failed to parse payment data:', error);
        }
      }
      
      if (!storedPaymentData) {
        toast({
          title: "Access Denied",
          description: "Please complete payment first.",
          variant: "destructive",
        });
        setLocation('/');
      }
    }
  }, [toast, setLocation]);

  const registerMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; fullName: string; stripeCustomerId?: string }) => {
      return await apiRequest("/api/auth/register-with-payment", {
        method: "POST",
        body: JSON.stringify(data)
      });
    },
    onSuccess: (data) => {
      localStorage.setItem("auth_token", data.token);
      
      // Clear payment data from session storage
      sessionStorage.removeItem('pendingPayment');
      
      toast({
        title: "Account Created Successfully!",
        description: `Welcome to Healthy Mama! Your ${paymentData?.paymentType === 'trial' ? '30-day free trial' : paymentData?.paymentType === 'monthly' ? 'monthly subscription' : 'founders access'} is now active.`,
      });
      
      // Redirect to dashboard
      setLocation('/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentData) {
      toast({
        title: "Error",
        description: "Payment data not found. Please contact support.",
        variant: "destructive",
      });
      return;
    }
    
    if (!password || !confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 8) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate({
      email: paymentData.email,
      password: password,
      fullName: paymentData.name,
      stripeCustomerId: paymentData.customerId,
    });
  };

  if (!paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-emerald-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p>Loading payment information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-emerald-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Payment Successful!
          </CardTitle>
          <CardDescription>
            Complete your account setup to start using Healthy Mama
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Payment Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-2">
            <h3 className="font-medium text-sm text-gray-700">Account Details</h3>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>{paymentData.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-400" />
              <span>{paymentData.name}</span>
            </div>
            <div className="text-sm text-purple-600 font-medium">
              {paymentData.paymentType === 'trial' ? '30-Day Free Trial' : 
               paymentData.paymentType === 'monthly' ? 'Monthly Subscription ($20/mo)' :
               'Founders Access (Lifetime)'}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Create Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  placeholder="Enter a secure password (8+ characters)"
                  type={showPassword ? "text" : "password"}
                  className="pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  type={showPassword ? "text" : "password"}
                  className="pr-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Creating Account..." : "Complete Setup"}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-xs text-gray-500">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}