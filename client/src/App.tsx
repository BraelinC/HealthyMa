import { useState, useEffect } from "react";
import { Switch, Route, useLocation, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AchievementNotification from "@/components/AchievementNotification";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Search from "@/pages/Search";
import EditableMealPlanner from "@/pages/EditableMealPlanner";
import MealPlanner from "@/pages/MealPlannerNew";
import Profile from "@/pages/Profile";

import IconShowcase from "@/pages/IconShowcase";
import { HandPlatter, BookOpen, ChefHat, LogOut, User, CalendarDays, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { AuthForm } from "@/components/AuthForm";
import { LandingPage } from "@/components/LandingPage";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Checkout from "@/pages/Checkout";

import Communities from "@/pages/Communities";
import CommunityDetail from "@/pages/CommunityDetail";
import CommunityDetailNew from "@/pages/CommunityDetailNew";
import PostDetail from "@/pages/PostDetail";
import CreatorHub from "@/pages/CreatorHub";
import CreateCommunity from "@/pages/CreateCommunity";
import CommunityManage from "@/pages/CommunityManage";

// ========== LANDING PAGE TOGGLE ==========
// Set this to false to skip the landing page and go directly to login
// Set this to true to show the landing page first
const SHOW_LANDING_PAGE = false;
// ========================================

function AppHeader() {
  const { user, isAuthenticated } = useAuth();
  
  // Type assertion for user object to fix TypeScript errors
  const typedUser = user as any;
  
  // Get profile data to extract the correct name for avatar
  const { data: profileData } = useQuery({
    queryKey: ["/api/profile"],
    enabled: isAuthenticated,
  });
  
  return (
    <header className="bg-gradient-to-r from-white via-purple-50 to-white px-4 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm border-b border-purple-100">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full shadow-md">
          <HandPlatter className="text-white h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Healthy Mama</h1>
      </div>
      
      <div className="flex items-center gap-2">
        {isAuthenticated && typedUser && (
          <Link to="/profile" className="flex items-center gap-2 hover:bg-purple-50 rounded-lg px-3 py-2 transition-colors cursor-pointer">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-sm bg-gradient-to-br from-purple-500 to-emerald-500 text-white font-semibold">
                {(() => {
                  // Use profile name from profile data, fallback to user.full_name
                  const name = (profileData as any)?.profile_name || typedUser.full_name || '';
                  const words = name.split(' ');
                  
                  if (words.length >= 2) {
                    return (words[0][0] + words[1][0]).toUpperCase();
                  } else if (words[0]) {
                    return words[0][0].toUpperCase();
                  }
                  
                  return typedUser.email?.[0]?.toUpperCase() || 'U';
                })()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium hidden sm:block">{(profileData as any)?.profile_name || typedUser.full_name || typedUser.email}</span>
          </Link>
        )}
      </div>
    </header>
  );
}

function NavLinks({ onClick }: { onClick?: () => void }) {
  const [location] = useLocation();
  
  const navItems = [
    { icon: <HandPlatter className="w-5 h-5" />, label: "Search", path: "/search" },
    { icon: <ChefHat className="w-5 h-5" />, label: "Home", path: "/" },
    { icon: <ChefHat className="w-5 h-5" />, label: "Meal Planner", path: "/meal-planner" },
  ];
  
  return (
    <>
      {navItems.map((item) => (
        <Link 
          key={item.path}
          to={item.path}
          className={`flex items-center gap-3 px-3 py-2 rounded-md text-base transition-all duration-150 ${location === item.path ? "bg-primary/10 text-primary font-medium" : "text-gray-700 hover:bg-gray-100"}`}
          onClick={onClick}
        >
          {item.icon}
          <span>{item.label}</span>
        </Link>
      ))}
    </>
  );
}

function AppTabBar() {
  const [location] = useLocation();
  
  const tabs = [
    { icon: <HandPlatter className="w-5 h-5" />, label: "Search", path: "/search" },
    { icon: <ChefHat className="w-5 h-5" />, label: "Home", path: "/" },
    { icon: <CalendarDays className="w-5 h-5" />, label: "Planner", path: "/meal-planner" },
    { icon: <Users className="w-5 h-5" />, label: "Communities", path: "/communities" },
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] flex justify-around py-3 z-40 border-t">
      {tabs.map((tab) => (
        <Link 
          key={tab.path}
          to={tab.path}
          className={`flex flex-col items-center px-4 py-2 transition-colors duration-150 ${location === tab.path ? "text-primary font-medium" : "text-gray-500 hover:text-gray-700"}`}
        >
          {tab.icon}
          <span className="text-xs mt-1">{tab.label}</span>
        </Link>
      ))}
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [checkoutState, setCheckoutState] = useState<{
    show: boolean;
    paymentType: 'founders' | 'trial' | null;
  }>({ show: false, paymentType: null });

  // Check for URL parameters that might indicate a successful auth or login request
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasAuthParams = urlParams.has('token') || urlParams.has('success') || window.location.pathname === '/';
    const hasLoginParam = urlParams.has('login');
    
    // If login parameter is present, show auth form directly
    if (hasLoginParam) {
      setShowAuth(true);
      // Clean up URL by removing login parameter
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
    
    // If we have auth-related URL params, clean them up
    if (hasAuthParams && (urlParams.has('token') || urlParams.has('success'))) {
      // Clean up URL by removing auth parameters
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

  const handleStartPayment = (paymentType: 'founders' | 'trial') => {
    setCheckoutState({ show: true, paymentType });
  };

  const handlePaymentSuccess = () => {
    // On payment success, proceed to auth/registration
    setCheckoutState({ show: false, paymentType: null });
    setShowAuth(true);
  };

  const handlePaymentCancel = () => {
    // Return to landing page
    setCheckoutState({ show: false, paymentType: null });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Show checkout if payment flow is active
    if (checkoutState.show && checkoutState.paymentType) {
      return (
        <Checkout
          paymentType={checkoutState.paymentType}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      );
    }
    
    if (!showAuth) {
      // Use the toggle to control whether to show landing page or go directly to auth
      if (SHOW_LANDING_PAGE) {
        return (
          <LandingPage 
            onGetStarted={() => setShowAuth(true)}
            onStartPayment={handleStartPayment}
            onTestLogin={() => setShowAuth(true)}
          />
        );
      } else {
        // Skip landing page and go directly to auth
        setShowAuth(true);
        return null;
      }
    }
    return (
      <AuthForm onSuccess={(user, token) => {
        localStorage.setItem("auth_token", token);
        window.location.reload();
      }} />
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Switch>
        <Route path="/landingpage" component={() => (
          <LandingPage 
            onGetStarted={() => {}} 
            onStartPayment={() => {}} 
            onTestLogin={() => {}} 
          />
        )} />
        <Route path="/logo" component={() => (
          <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="p-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full shadow-2xl">
              <HandPlatter className="text-white h-32 w-32" />
            </div>
          </div>
        )} />
        <Route component={() => (
          <>
            <AppHeader />
            <main className="flex-grow pb-16"> {/* Add bottom padding for the tab bar */}
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/search" component={Search} />
                <Route path="/meal-planner" component={MealPlanner} />
                <Route path="/communities" component={Communities} />
                <Route path="/community/create" component={CreateCommunity} />
                <Route path="/create" component={CreateCommunity} />
                <Route path="/creator-hub" component={CreatorHub} />
                <Route path="/community/:id/manage" component={CommunityManage} />
                <Route path="/community/:communityId/post/:postId" component={PostDetail} />
                <Route path="/community/:id" component={CommunityDetailNew} />
                <Route path="/profile" component={Profile} />
                <Route path="/icons" component={IconShowcase} />
                <Route component={NotFound} />
              </Switch>
            </main>
            <AppTabBar />
            <AchievementNotification />
          </>
        )} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
