import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HandPlatter, CheckCircle, ChefHat, Heart, DollarSign, Info, Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LandingPageProps {
  onGetStarted: () => void;
  onStartPayment: (paymentType: 'founders' | 'trial') => void;
}

export function LandingPage({ onGetStarted, onStartPayment }: LandingPageProps) {
  const [currentFounders, setCurrentFounders] = useState(0);
  const totalFounders = 1000;
  
  // TODO: This will be updated with real user count from database
  // For now, starts at 0 and will increment with each new user signup
  
  const progressPercentage = (currentFounders / totalFounders) * 100;
  
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
            <h1 className="relative text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-6 leading-tight">
              Eat Better. Save<br />More. Stress Less.
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Transform your family's meals with AI-powered planning that saves time and money while keeping everyone healthy and happy.
          </p>
        </div>

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
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Founding Offer</h2>
              
              <Card className="max-w-2xl mx-auto border-2 border-purple-300 hover:border-purple-500 transition-all duration-300 hover:shadow-2xl bg-gradient-to-br from-purple-25 via-white to-indigo-25 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100/30 to-indigo-100/30"></div>
                <CardContent className="relative p-8">
                  <div className="space-y-6">
                    {/* Offer Header */}
                    <div className="text-center border-b border-purple-200 pb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <DollarSign className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-2">
                        Join Healthy Mama for <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">$99</span>
                      </h3>
                      <p className="text-gray-600 text-lg">(Regular price: $360/year)</p>
                      <Badge className="mt-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-3 py-1">
                        75% OFF - Limited Time
                      </Badge>
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-100 p-2 rounded-full flex-shrink-0">
                          <ChefHat className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-semibold">AI Meal Planning Engine</h4>
                          <p className="text-sm text-gray-600">Save $782 This Year Just by Wasting Less Food — and Up to $3,000 With Healthy Mama</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="bg-emerald-100 p-2 rounded-full flex-shrink-0">
                          <Heart className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-semibold">Healthy Eating Recommendations</h4>
                          <p className="text-sm text-gray-600">Meals that fit your life, no overthinking</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                          <DollarSign className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-semibold">Double Your Money Back Guarantee</h4>
                          <p className="text-sm text-gray-600">Don't save money or feel more in control? Get $200 back</p>
                        </div>
                      </div>
                    </div>

                    {/* Call to Action Button */}
                    <div className="pt-4 border-t border-purple-200">
                      <Button 
                        onClick={() => onStartPayment('founders')}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 py-3 text-lg font-semibold"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <DollarSign className="w-5 h-5" />
                          Get Founding Access - $99
                        </span>
                      </Button>
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
              {currentFounders === 0 ? "1000 founding spots available" : `Only ${totalFounders - currentFounders} spots left`}
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
            <span className="flex items-center gap-2">
              <DollarSign className="w-6 h-6" />
              Become a Founder - $99
            </span>
          </Button>
          
          <div className="mt-6 text-sm text-gray-600">
            <p className="mb-1">Join once. Unlock every future feature, tool, and surprise we ever create—forever</p>
            <p className="font-semibold text-purple-700">Sign up now or lose this offer forever. No second chances.</p>
          </div>
        </div>
      </div>
    </div>
  );
}