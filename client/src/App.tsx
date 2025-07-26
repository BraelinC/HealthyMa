import { useState } from "react";
import { Switch, Route, useLocation, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AchievementNotification from "@/components/AchievementNotification";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Search from "@/pages/Search";
import EditableMealPlanner from "@/pages/EditableMealPlanner";
import MealPlanner from "@/pages/MealPlannerNew";
import Profile from "@/pages/Profile";
import WeightBasedProfile from "@/components/WeightBasedProfile";
import { TestingPage } from "@/pages/TestingPage";
import IconShowcase from "@/pages/IconShowcase";
import { HandPlatter, BookOpen, ChefHat, Menu, LogOut, User, CalendarDays, TestTube, Palette, Target, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AuthForm } from "@/components/AuthForm";
import { LandingPage } from "@/components/LandingPage";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Checkout from "@/pages/Checkout";

// ========== LANDING PAGE TOGGLE ==========
// Set this to false to skip the landing page and go directly to login
// Set this to true to show the landing page first
const SHOW_LANDING_PAGE = true;
// ========================================

function AppHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  
  return (
    <header className="bg-gradient-to-r from-white via-purple-50 to-white px-4 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm border-b border-purple-100">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full shadow-md">
          <HandPlatter className="text-white h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Healthy Mama</h1>
      </div>
      
      <div className="flex items-center gap-2">
        {isAuthenticated && user && (
          <Link to="/profile" className="hidden sm:flex items-center gap-2 mr-2 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors cursor-pointer">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-sm">
                {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{user.full_name}</span>
          </Link>
        )}
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <div className="flex flex-col gap-6 mt-8">
              {isAuthenticated && user && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{user.full_name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              )}
              
              <NavLinks onClick={() => setIsOpen(false)} />
              
              {isAuthenticated && (
                <>
                  <Link 
                    to="/profile"
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-base transition-all duration-150 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </Link>
                  
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2" 
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
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
    { icon: <Target className="w-5 h-5" />, label: "Smart Profile", path: "/smart-profile" },
    { icon: <TestTube className="w-5 h-5" />, label: "Test Features", path: "/testing" },
    { icon: <Palette className="w-5 h-5" />, label: "Food Icons", path: "/icons" },
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
  const { isAuthenticated, isLoading, login } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [checkoutState, setCheckoutState] = useState<{
    show: boolean;
    paymentType: 'founders' | 'trial' | null;
  }>({ show: false, paymentType: null });

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
            onTestLogin={login}
          />
        );
      } else {
        // Skip landing page and go directly to auth
        setShowAuth(true);
        return null;
      }
    }
    return <AuthForm onSuccess={login} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AppHeader />
      <main className="flex-grow pb-16"> {/* Add bottom padding for the tab bar */}
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/search" component={Search} />
          <Route path="/meal-planner" component={MealPlanner} />
          <Route path="/profile" component={Profile} />
          <Route path="/smart-profile" component={WeightBasedProfile} />
          <Route path="/testing" component={TestingPage} />
          <Route path="/icons" component={IconShowcase} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <AppTabBar />
      <AchievementNotification />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
