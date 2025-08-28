import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HandPlatter, CheckCircle, ChefHat, Heart, DollarSign, Info, Check, X, User, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LandingPageProps {
  onGetStarted: () => void;
  onStartPayment: (paymentType: 'founders' | 'trial') => void;
  onTestLogin?: (user: any, token: string) => void;
}

export function LandingPage({ onGetStarted, onStartPayment, onTestLogin }: LandingPageProps) {
  const [currentFounders, setCurrentFounders] = useState(0);
  const totalFounders = 100;
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const { toast } = useToast();
  
  // TODO: This will be updated with real user count from database
  // For now, starts at 0 and will increment with each new user signup
  
  const progressPercentage = (currentFounders / totalFounders) * 100;

  const handleTestLogin = async () => {
    if (!onTestLogin) return;
    
    setIsTestLoading(true);
    try {
      const response = await apiRequest("/api/auth/test-login", {
        method: "POST",
        body: JSON.stringify({})
      });
      
      onTestLogin(response.user, response.token);
      toast({
        title: "Test login successful",
        description: "Welcome! You're now logged in as the test user.",
      });
    } catch (error: any) {
      toast({
        title: "Test login failed",
        description: error.message || "Failed to log in as test user",
        variant: "destructive",
      });
    } finally {
      setIsTestLoading(false);
    }
  };

  const handleResetTestUser = async () => {
    setResetLoading(true);
    try {
      await apiRequest("/api/auth/reset-test-user", {
        method: "POST",
        body: JSON.stringify({})
      });
      
      toast({
        title: "Test user reset",
        description: "Test user has been reset. You can now log in with fresh data.",
      });
    } catch (error: any) {
      toast({
        title: "Reset failed",
        description: error.message || "Failed to reset test user",
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Header */}
      <header className="px-4 py-3 flex justify-center items-center bg-white/80 backdrop-blur-sm border-b border-purple-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full shadow-lg">
            <HandPlatter className="text-white h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Healthy Mama</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-indigo-400/20 blur-3xl rounded-full transform scale-150"></div>
            <h1 className="relative text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4 leading-tight">
              Never ask 'What's for dinner?' again.
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            The Future of Meals is Shared
          </p>
        </div>

        {/* Test User Login Section */}
        {false && onTestLogin && (
          <div className="text-center mb-8">
            <Card className="max-w-md mx-auto border-2 border-green-200 bg-green-50/50 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 justify-center mb-4">
                  <User className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-800">Test User Access</h3>
                </div>
                <p className="text-sm text-green-700 mb-4">
                  Try the app instantly without creating an account
                </p>
                <div className="flex gap-2 justify-center">
                  <Button 
                    onClick={handleTestLogin}
                    disabled={isTestLoading}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    {isTestLoading ? "Logging in..." : "Login as Test User"}
                  </Button>
                  <Button 
                    onClick={handleResetTestUser}
                    disabled={resetLoading}
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-100 flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {resetLoading ? "Resetting..." : "Reset User"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabbed Offers */}
        <div className="text-center mb-6">
          <Tabs defaultValue="founders" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/60 backdrop-blur-sm border border-purple-200 p-1 rounded-lg shadow-lg">
              <TabsTrigger value="founders" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 rounded-md">
                <span className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Founders Offer
                </span>
              </TabsTrigger>
              <TabsTrigger value="trial" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 rounded-md">
                <span className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Free Trial
                </span>
              </TabsTrigger>
            </TabsList>
            
            {/* Free Trial Tab */}
            <TabsContent value="trial">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Choose Your Trial</h2>
              
              {/* Trial Options */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* 7-Day No-Card Trial */}
                <Card className="border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-xl bg-white/70 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <CheckCircle className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">7-Day Trial</h3>
                    <p className="text-gray-600 mb-4 text-center">Instant access, no payment details required.</p>
                    <Button 
                      onClick={onGetStarted}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Start Free Trial
                    </Button>
                  </CardContent>
                </Card>
                
                {/* 21-Day Premium Trial */}
                <Card className="border-2 border-purple-300 hover:border-purple-500 transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-purple-50 to-indigo-50 relative">
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md px-3 py-1 text-sm">
                    Popular
                  </Badge>
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <Heart className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">21-Day Premium Trial</h3>
                    <p className="text-gray-600 mb-4 text-center">Extended features, priority support, $0 charge upfront</p>
                    <Button 
                      onClick={() => onStartPayment('trial')}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Unlock 21-Day Trial
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              {/* Benefits Comparison */}
              <div className="max-w-3xl mx-auto">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Compare Trial Benefits</h3>
                <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-purple-200 overflow-hidden shadow-lg">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-purple-50 to-indigo-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">7-Day Trial</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-purple-700">21-Day Premium</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-900">Unlimited access to weekly planner</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-500">2 weekly plans</td>
                        <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-emerald-600 mx-auto" /></td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-900">Unlimited searches</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-500">10 searches</td>
                        <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-emerald-600 mx-auto" /></td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-900">Customizable plans</td>
                        <td className="px-6 py-4 text-center"><X className="h-5 w-5 text-red-400 mx-auto" /></td>
                        <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-emerald-600 mx-auto" /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
            
            {/* Founders Offer Tab */}
            <TabsContent value="founders">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">For a limited time, join as a Founding Member:</h2>
              
              {/* Pricing Options */}
              <div className="max-w-3xl mx-auto mb-8">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Lifetime Access */}
                  <Card className="border-2 border-purple-300 hover:border-purple-500 transition-all duration-300 hover:shadow-2xl bg-gradient-to-br from-purple-25 via-white to-indigo-25 relative">
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md px-3 py-1 text-sm">
                      Best Value
                    </Badge>
                    <CardContent className="p-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Lifetime Access</h3>
                      <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">$100</p>
                      <p className="text-sm text-gray-600 mb-4">One-time payment<br/>(less than 5 skipped takeout orders)</p>
                      <Button 
                        onClick={() => onStartPayment('founders')}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        Get Lifetime Access
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Monthly Option */}
                  <Card className="border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-xl bg-white/70 backdrop-blur-sm">
                    <CardContent className="p-6 pt-9">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Monthly</h3>
                      <p className="text-3xl font-bold text-gray-800 mb-2">$20<span className="text-lg text-gray-600">/mo</span></p>
                      <p className="text-sm text-gray-600 mb-4">Try it monthly<br/>Cancel anytime</p>
                      <Button 
                        onClick={onGetStarted}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        Start Monthly
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <p className="text-center text-gray-600 mt-4 font-medium">
                  Either way, you're going to love it — or I'll refund you, no questions asked.
                </p>
              </div>

              {/* What You Get */}
              <Card className="max-w-3xl mx-auto mb-8 border-2 border-purple-200 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">What You Get:</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">📅</span>
                      <div>
                        <h4 className="font-semibold">Week's Worth of Meals Planned in 2 Minutes</h4>
                        <p className="text-sm text-gray-600">that actually use ingredients you have</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">👩‍🍳</span>
                      <div>
                        <h4 className="font-semibold">Family Recipe Exchange</h4>
                        <p className="text-sm text-gray-600">Finally get your mom's secret seasoning tricks and your friend's pasta sauce that's always perfect</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">📲</span>
                      <div>
                        <h4 className="font-semibold">Meal Sharing</h4>
                        <p className="text-sm text-gray-600">Organize potlucks, swaps, or family-style cooking with your community</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">💡</span>
                      <div>
                        <h4 className="font-semibold">Ready-Made Plans</h4>
                        <p className="text-sm text-gray-600">Pre-built weekly menus to save you hours every week</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Founding Member Perks */}
              <Card className="max-w-3xl mx-auto mb-8 border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-50">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Founding Member Perks</h3>
                  <p className="text-sm text-gray-600 mb-6">(first 100 only)</p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">🏆</span>
                      <div>
                        <h4 className="font-semibold">Founding Badge</h4>
                        <p className="text-sm text-gray-600">Permanent recognition inside the app</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-xl">🍲</span>
                      <div>
                        <h4 className="font-semibold">Recipe Spotlight</h4>
                        <p className="text-sm text-gray-600">Your meal plans featured & promoted first</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-xl">💸</span>
                      <div>
                        <h4 className="font-semibold">Never Pay Platform Fees</h4>
                        <p className="text-sm text-gray-600">Save $200/year forever</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-xl">🤝</span>
                      <div>
                        <h4 className="font-semibold">Help Build Features</h4>
                        <p className="text-sm text-gray-600">Direct input on what we create next</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </TabsContent>
          </Tabs>
        </div>

        {/* Founders Counter */}
        <div className="text-center mb-6">
          <div className="max-w-lg mx-auto bg-gradient-to-r from-purple-50 to-emerald-50 rounded-xl p-6 border border-purple-200 shadow-lg">
            <div className="mb-4">
              <div className="text-lg font-semibold text-purple-900 mb-3">
                {currentFounders === 0 ? "Be the first founder to start saving money" : `Join ${currentFounders.toLocaleString()} founders already saving money`}
              </div>
              <div className="text-4xl font-bold text-purple-600">
                {currentFounders}/{totalFounders} Founders
              </div>
            </div>
            
            {/* Progress Circle */}
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercentage / 100)}`}
                  className="transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                />
                {/* Gradient definition */}
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#50C878" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-purple-900">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
            </div>
            
            <div className="text-sm text-purple-700 font-medium">
              {currentFounders === 0 ? "100 founding spots available" : `Only ${totalFounders - currentFounders} spots left`}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            size="lg" 
            onClick={() => onStartPayment('founders')}
            className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:via-indigo-700 hover:to-purple-800 text-white px-12 py-4 text-xl font-bold rounded-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            <span className="flex items-center justify-center">
              Never ask "what's for dinner?"
            </span>
          </Button>
        </div>

      </div>
    </div>
  );
}