import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CustomCalendar } from "@/components/ui/custom-calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays, Clock, ChefHat, ShoppingCart, Target, ChevronDown, ChevronRight, Calendar as CalendarIcon, List, Save, Home, Users } from "lucide-react";
import { format, addDays, differenceInDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import PastGenerations from "@/components/PastGenerations";
import MealPlanDebugger from "@/components/MealPlanDebugger";
import QuickAuthDebug from "@/components/QuickAuthDebug";
import { useProfileSystem } from "@/hooks/useProfileSystem";
import ProfileSystemIndicator from "@/components/ProfileSystemIndicator";
import { 
  generateMealPlanName, 
  generateMealPlanDescription, 
  shouldAutoSaveMealPlan,
  ensureUniqueName,
  type MealPlanGenerationParams 
} from "@/lib/mealPlanUtils";
import { 
  addToSessionCache, 
  getSessionCache, 
  initializeSessionCache,
  type SessionCachedPlan 
} from "@/lib/sessionCache";
// import { DateRange } from "react-day-picker";

interface DateRange {
  from?: Date;
  to?: Date;
}

interface Meal {
  title: string;
  cook_time_minutes: number;
  difficulty: number;
  ingredients: string[];
  instructions: string[];
  nutrition: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
}

interface DayPlan {
  breakfast?: Meal;
  lunch?: Meal;
  dinner?: Meal;
  snack?: Meal;
}

interface PlanResponse {
  meal_plan: Record<string, DayPlan>;
  shopping_list: string[];
  prep_tips: string[];
  estimated_savings?: number;
}

export default function MealPlanner() {
  // Profile system detection
  const { isSmartProfileEnabled } = useProfileSystem();
  
  const [cookTime, setCookTime] = useState([30]);
  const [difficulty, setDifficulty] = useState([3.0]);
  const [nutritionGoal, setNutritionGoal] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");
  const [availableIngredients, setAvailableIngredients] = useState("");
  const [excludeIngredients, setExcludeIngredients] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const { toast } = useToast();
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [numDays, setNumDays] = useState([1]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [mealsPerDay, setMealsPerDay] = useState([3]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Initialize session cache on component mount
  useEffect(() => {
    initializeSessionCache();
  }, []);
  const [generatedPlan, setGeneratedPlan] = useState<PlanResponse | null>(null);
  const [openDays, setOpenDays] = useState<Set<number>>(new Set());
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set());
  const [shoppingUrl, setShoppingUrl] = useState<string>("");
  const [primaryGoal, setPrimaryGoal] = useState("");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedFamilyMembers, setSelectedFamilyMembers] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(true); // Auto-show calendar on page load

  // UNIFIED GOAL SYSTEM - Frontend mirrors backend goals exactly
  const unifiedGoals = [
    { value: "Save Money", label: "💰 Save Money", nutritionFocus: "general_wellness" },
    { value: "Eat Healthier", label: "🥗 Eat Healthier", nutritionFocus: "general_wellness" },
    { value: "Gain Muscle", label: "💪 Gain Muscle", nutritionFocus: "muscle_gain" },
    { value: "Lose Weight", label: "🎯 Lose Weight", nutritionFocus: "weight_loss" },
    { value: "Family Nutrition", label: "👨‍👩‍👧‍👦 Family Nutrition", nutritionFocus: "general_wellness" },
    { value: "Energy & Performance", label: "⚡ Energy & Performance", nutritionFocus: "energy_performance" },
    { value: "Digestive Health", label: "🌿 Digestive Health", nutritionFocus: "digestive_health" },
  ];

  const nutritionGoals = [
    { value: "weight_loss", label: "Weight Loss" },
    { value: "weight_maintenance", label: "Weight Maintenance" },
    { value: "muscle_gain", label: "Muscle Gain" },
    { value: "metabolic_health", label: "Metabolic Health" },
    { value: "energy_performance", label: "Energy & Performance" },
    { value: "digestive_health", label: "Digestive Health" },
    { value: "general_wellness", label: "General Wellness" }
  ];

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch('/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const profile = await response.json();
          setUserProfile(profile);
          // If it's a family profile, pre-select all family members
          if (profile.profile_type === 'family' && profile.members) {
            setSelectedFamilyMembers(profile.members.map((member: any) => member.name));
          }
          // Auto-fill primary goal from profile
          if (profile.primary_goal) {
            setPrimaryGoal(profile.primary_goal);
            // Auto-set nutrition goal based on primary goal using unified system
            const matchedGoal = unifiedGoals.find(g => g.value === profile.primary_goal);
            if (matchedGoal) {
              setNutritionGoal(matchedGoal.nutritionFocus);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const toggleFamilyMember = (memberName: string) => {
    setSelectedFamilyMembers(prev => 
      prev.includes(memberName) 
        ? prev.filter(name => name !== memberName)
        : [...prev, memberName]
    );
  };

  const handleGeneratePlan = async () => {
    // Validate that dates are selected
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select a date range first",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    console.log(`🔄 Generating meal plan using ${isSmartProfileEnabled ? 'SMART' : 'TRADITIONAL'} profile system`);
    
    try {
      const token = localStorage.getItem('auth_token');
      let response;
      
      if (isSmartProfileEnabled) {
        // SMART PROFILE SYSTEM - Use weight-based endpoint
        console.log('🎯 Using weight-based meal planning system');
        
        response = await fetch('/api/meal-plan/generate-weight-based', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify({
            numDays: numDays[0],
            mealsPerDay: mealsPerDay[0],
            maxCookTime: cookTime[0],
            maxDifficulty: difficulty[0] / 5, // Convert to 0-1 scale
            familySize: selectedFamilyMembers.length || 2,
            // dietaryRestrictions and goalWeights are fetched from user's weight-based profile
          }),
        });
      } else {
        // TRADITIONAL PROFILE SYSTEM - Use original endpoint (unchanged)
        console.log('👨‍👩‍👧‍👦 Using traditional family-based meal planning system');
        
        response = await fetch('/api/meal-plan/generate', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify({
            numDays: numDays[0],
            mealsPerDay: mealsPerDay[0],
            cookTime: cookTime[0],
            difficulty: difficulty[0],
            nutritionGoal,
            dietaryRestrictions,
            availableIngredients,
            excludeIngredients,
            primaryGoal,
            selectedFamilyMembers,
            useIntelligentPrompt: true
          })
        });
      }

      if (!response.ok) throw new Error('Failed to generate meal plan');
      
      const data = await response.json();
      console.log('Generated meal plan data:', data);
      console.log('Number of days in meal_plan:', Object.keys(data.meal_plan || {}).length);
      
      // Reset state to ensure proper display
      setOpenDays(new Set());
      setExpandedMeals(new Set());
      setGeneratedPlan(data);
      
      // Auto-save the generated meal plan
      console.log('Triggering auto-save in 500ms...');
      setTimeout(() => {
        console.log('Auto-save timeout reached, calling autoSaveMealPlan...');
        autoSaveMealPlan(data);
      }, 500); // Small delay to ensure state is updated
    } catch (error) {
      console.error('Error generating meal plan:', error);
      alert('Failed to generate meal plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save meal plan mutation
  const savePlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/meal-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(planData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save meal plan');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate meal plans cache so the UI updates
      queryClient.invalidateQueries({ queryKey: ['/api/meal-plans/saved'] });
      
      toast({
        title: "Success",
        description: "Meal plan saved! You can now edit it on your home page.",
      });
      setShowSaveDialog(false);
      setPlanName("");
      setPlanDescription("");
      // Redirect to home page
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save meal plan",
        variant: "destructive",
      });
    }
  });

  // Auto-save function using session cache (no database calls, no UI disruption)
  const autoSaveToSessionCache = (mealPlan: PlanResponse) => {
    setIsAutoSaving(true);
    
    try {
      // Generate parameters for naming
      const generationParams: MealPlanGenerationParams = {
        numDays,
        mealsPerDay,
        primaryGoal,
        selectedFamilyMembers,
        nutritionGoal,
        dietaryRestrictions,
        cookTime,
        difficulty,
        startDate: startDate || new Date()
      };

      // Get existing session cache items for unique naming
      const sessionCache = getSessionCache();
      const existingNames = sessionCache.map(plan => plan.name);

      // Generate smart name and description
      const baseName = generateMealPlanName(generationParams);
      const uniqueName = ensureUniqueName(baseName, existingNames);
      const description = generateMealPlanDescription(generationParams);

      // Add to session cache
      const sessionPlan = addToSessionCache({
        name: uniqueName,
        description,
        mealPlan: mealPlan.meal_plan
      });

      console.log('✅ Auto-save to session cache successful:', sessionPlan.name);
      setIsAutoSaving(false);
      
    } catch (error) {
      console.error('❌ Auto-save to session cache failed:', error);
      setIsAutoSaving(false);
    }
  };

  // Auto-save function - now uses session cache instead of database
  const autoSaveMealPlan = (mealPlan: PlanResponse) => {
    console.log('🔄 AutoSave: Starting session cache auto-save...');
    console.log('🔄 AutoSave: Meal plan data:', mealPlan);
    
    if (!shouldAutoSaveMealPlan(mealPlan)) {
      console.log('❌ AutoSave: Skipping auto-save - meal plan does not meet criteria');
      return;
    }

    console.log('✅ AutoSave: Meal plan meets criteria, saving to session cache...');
    
    // Use session cache instead of database save
    autoSaveToSessionCache(mealPlan);
  };

  const handleSavePlan = () => {
    if (!generatedPlan) {
      toast({
        title: "Error",
        description: "No meal plan to save. Generate a plan first.",
        variant: "destructive",
      });
      return;
    }

    if (!planName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a plan name",
        variant: "destructive",
      });
      return;
    }
    
    savePlanMutation.mutate({
      name: planName,
      description: planDescription,
      meal_plan: generatedPlan.meal_plan
    });
  };

  const handleCreateShoppingList = async () => {
    if (!generatedPlan?.shopping_list) return;
    
    try {
      const response = await fetch('/api/recipes/instacart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: "Weekly Meal Plan Shopping List",
          ingredients: generatedPlan.shopping_list.map(item => ({
            name: item.replace(/\s×\d+$/, ''),
            display_text: item,
            measurements: []
          }))
        })
      });

      if (!response.ok) throw new Error('Failed to create shopping list');
      
      const data = await response.json();
      setShoppingUrl(data.products_link_url);
      window.open(data.products_link_url, '_blank');
    } catch (error) {
      console.error('Error creating shopping list:', error);
      alert('Failed to create shopping list. Please try again.');
    }
  };

  const toggleDay = (dayIndex: number) => {
    const newOpenDays = new Set(openDays);
    if (newOpenDays.has(dayIndex)) {
      newOpenDays.delete(dayIndex);
    } else {
      newOpenDays.add(dayIndex);
    }
    setOpenDays(newOpenDays);
  };

  const toggleMealIngredients = (mealId: string) => {
    const newExpandedMeals = new Set(expandedMeals);
    if (newExpandedMeals.has(mealId)) {
      newExpandedMeals.delete(mealId);
    } else {
      newExpandedMeals.add(mealId);
    }
    setExpandedMeals(newExpandedMeals);
  };

  const getDayName = (dayIndex: number) => {
    if (!startDate) return `Day ${dayIndex + 1}`;
    const targetDay = addDays(startDate, dayIndex);
    return format(targetDay, 'EEEE (MMM d)');
  };

  const getDayNameFromKey = (dayKey: string): string => {
    if (!startDate) return dayKey.replace('_', ' ');
    // Extract day number from key like "day_1", "day_2", etc.
    const dayNumber = parseInt(dayKey.split('_')[1]) - 1; // Convert to 0-based index
    const currentDate = addDays(startDate, dayNumber);
    return format(currentDate, "EEEE (MMM d)");
  };

  // Force re-render when meal plan changes
  const mealPlanDays = generatedPlan?.meal_plan ? Object.keys(generatedPlan.meal_plan).sort() : [];
  
  // Debug logging
  useEffect(() => {
    if (generatedPlan?.meal_plan) {
      console.log('Meal plan keys:', Object.keys(generatedPlan.meal_plan));
      console.log('Sorted meal plan days:', mealPlanDays);
    }
  }, [generatedPlan]);

  // Update numDays when date range changes - NO LIMITATIONS!
  const updateDateRange = (range: DateRange | undefined) => {
    console.log('updateDateRange called with:', range);
    setDateRange(range);
    if (range?.from) {
      setStartDate(range.from);
      if (range.to) {
        setEndDate(range.to);
        const days = differenceInDays(range.to, range.from) + 1;
        console.log('Setting numDays to:', days);
        setNumDays([days]);
      } else {
        // Only start date selected - keep end date undefined until user selects it
        setEndDate(undefined);
        setNumDays([1]); // Single day for now
      }
    } else {
      // No date selected
      setStartDate(undefined);
      setEndDate(undefined);
      setNumDays([1]);
    }
  };

  const getDifficultyLabel = (level: number) => {
    if (level <= 2) return "Beginner";
    if (level <= 3.5) return "Intermediate"; 
    return "Advanced";
  };

  const getDifficultyDescription = (level: number) => {
    if (level === 1) return "Basic mixing, heating, assembly";
    if (level === 1.5) return "Simple prep with basic cooking";
    if (level === 2) return "Simple cooking methods, minimal timing";
    if (level === 2.5) return "Basic cooking with some technique";
    if (level === 3) return "Multiple steps, some technique required";
    if (level === 3.5) return "Complex preparations";
    if (level === 4) return "Complex techniques, precise timing";
    if (level === 4.5) return "Professional techniques";
    if (level === 5) return "Expert techniques, critical timing";
    return "Intermediate cooking";
  };

  return (
    <div className="p-3 sm:p-6 max-w-6xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent" style={{ background: 'linear-gradient(to right, #50C878, #45B369)', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>
          AI Weekly Meal Planner
        </h1>
        <p className="text-muted-foreground text-sm sm:text-lg">
          Get personalized meal plans with smart shopping lists
        </p>
        <div className="flex justify-center mt-3">
          <ProfileSystemIndicator />
        </div>
      </div>


      {/* Family Member Selector */}
      {userProfile && userProfile.profile_type === 'family' && userProfile.members && userProfile.members.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">👨‍👩‍👧‍👦</span>
              Who is this meal plan for?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Select family members to include in your meal plan
              </p>
              <div className="flex flex-wrap gap-2">
                {userProfile.members.map((member: any) => (
                  <Button
                    key={member.name}
                    variant={selectedFamilyMembers.includes(member.name) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleFamilyMember(member.name)}
                    className={selectedFamilyMembers.includes(member.name) ? "bg-green-500 hover:bg-green-600" : ""}
                  >
                    {member.name}
                    {member.ageGroup && (
                      <Badge variant="secondary" className="ml-1">
                        {member.ageGroup}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
              {selectedFamilyMembers.length > 0 && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-800">
                    Creating meal plan for: {selectedFamilyMembers.join(", ")}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Planning Controls */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5" style={{ color: '#50C878' }} />
              Plan Your Week
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Auto-shown Calendar Date Range - Primary Filter */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-green-500" />
                <label className="font-semibold text-lg">Select Your Planning Period</label>
              </div>
              
              {/* Calendar auto-shows on page load */}
              <div className="border rounded-lg p-3 bg-gray-50">
                <div className="p-3 border-b bg-white rounded-t-lg">
                  <p className="text-sm text-muted-foreground">
                    Click and drag to select your meal planning dates
                  </p>
                </div>
                <CustomCalendar
                  selected={dateRange}
                  onSelect={updateDateRange}
                  numberOfMonths={window.innerWidth < 768 ? 1 : 2}
                  disabled={(date) => {
                    const yesterday = new Date();
                    yesterday.setHours(0, 0, 0, 0);
                    yesterday.setDate(yesterday.getDate() - 1);
                    return date < yesterday;
                  }}
                />
                <div className="mt-2 p-2 bg-white rounded-b-lg text-center">
                  <p className="text-sm font-medium text-green-700">
                    {startDate && endDate ? 
                      `${format(startDate, "EEEE, MMM d")} to ${format(endDate, "EEEE, MMM d")} (${numDays[0]} days)` :
                      startDate ? `${format(startDate, "EEEE, MMM d")} - select end date` :
                      "Select your date range above"
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Condensed Main Filters */}
            <div className="grid grid-cols-2 gap-3">
              {/* Consolidated Goal Selection */}
              <div className="space-y-2">
                <label className="font-medium text-sm">Main Goal</label>
                <Select value={primaryGoal} onValueChange={(value) => {
                  setPrimaryGoal(value);
                  // Auto-set nutrition goal based on unified goal system
                  const matchedGoal = unifiedGoals.find(g => g.value === value);
                  if (matchedGoal) {
                    setNutritionGoal(matchedGoal.nutritionFocus);
                  }
                }}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Choose goal" />
                  </SelectTrigger>
                  <SelectContent>
                    {unifiedGoals.map((goal) => (
                      <SelectItem key={goal.value} value={goal.value}>
                        {goal.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Meals per Day */}
              <div className="space-y-2">
                <label className="font-medium text-sm">Meals/Day: {mealsPerDay[0]}</label>
                <Slider 
                  min={1} max={4} step={1} 
                  value={mealsPerDay} 
                  onValueChange={setMealsPerDay}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground text-center">
                  Total: {numDays[0] * mealsPerDay[0]} meals
                </div>
              </div>
            </div>

            {/* Advanced Filters Dropdown */}
            <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <ChefHat className="h-4 w-4" />
                    Advanced Options
                  </span>
                  {showAdvancedFilters ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-4 border-t mt-3">
                {/* Cook Time */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-500" />
                    <label className="font-medium">Max cook time: {cookTime[0]} minutes</label>
                  </div>
                  <Slider 
                    min={10} max={120} step={10} 
                    value={cookTime} 
                    onValueChange={setCookTime}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>10 min</span>
                    <span>2 hours</span>
                  </div>
                </div>

                {/* Difficulty */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ChefHat className="h-4 w-4 text-yellow-500" />
                    <label className="font-medium">Difficulty: {difficulty[0]}/5 ({getDifficultyLabel(difficulty[0])})</label>
                  </div>
                  <Slider 
                    min={1} max={5} step={0.5} 
                    value={difficulty} 
                    onValueChange={setDifficulty}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 - Beginner</span>
                    <span>3 - Intermediate</span>
                    <span>5 - Expert</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {getDifficultyDescription(difficulty[0])}
                  </div>
                </div>

                {/* Dietary Restrictions */}
                <div className="space-y-2">
                  <label className="font-medium">Dietary Restrictions</label>
                  <Input
                    placeholder="e.g., vegetarian, gluten-free, low-carb"
                    value={dietaryRestrictions}
                    onChange={(e) => setDietaryRestrictions(e.target.value)}
                  />
                </div>

                {/* Available Ingredients */}
                <div className="space-y-2">
                  <label className="font-medium">Available Ingredients</label>
                  <Input
                    placeholder="e.g., chicken, rice, broccoli"
                    value={availableIngredients}
                    onChange={(e) => setAvailableIngredients(e.target.value)}
                  />
                </div>

                {/* Exclude Ingredients */}
                <div className="space-y-2">
                  <label className="font-medium">Avoid These Ingredients</label>
                  <Input
                    placeholder="e.g., shellfish, nuts, dairy"
                    value={excludeIngredients}
                    onChange={(e) => setExcludeIngredients(e.target.value)}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Button 
              onClick={handleGeneratePlan} 
              disabled={isGenerating || !startDate || !endDate}
              className="w-full hover:opacity-90"
              style={{ background: 'linear-gradient(to right, #50C878, #45B369)' }}
            >
              {isGenerating ? "Generating Plan..." : "Generate Meal Plan"}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Plan */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-green-500" />
              Your Meal Plan
              {isAutoSaving && (
                <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  <div className="animate-spin h-3 w-3 border border-blue-600 border-t-transparent rounded-full"></div>
                  Auto-saving...
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!generatedPlan ? (
              <div className="text-center text-muted-foreground py-12">
                <ChefHat className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Generate a meal plan to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button 
                    onClick={handleCreateShoppingList}
                    variant="outline"
                    className="flex-1"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Create Shopping List
                  </Button>
                  
                  <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                    <DialogTrigger asChild>
                      <Button className="flex-1">
                        <Save className="h-4 w-4 mr-2" />
                        Save Plan
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Save Meal Plan</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Plan Name</label>
                          <Input
                            placeholder="e.g., This Week's Healthy Meals"
                            value={planName}
                            onChange={(e) => setPlanName(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                          <Textarea
                            placeholder="Any notes about this meal plan..."
                            value={planDescription}
                            onChange={(e) => setPlanDescription(e.target.value)}
                          />
                        </div>
                        <div className="text-sm text-gray-600">
                          This will save your {numDays[0]}-day meal plan with {numDays[0] * mealsPerDay[0]} total meals. You'll be able to edit it on your home page.
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleSavePlan} disabled={savePlanMutation.isPending}>
                            {savePlanMutation.isPending ? "Saving..." : "Save & Go to Home"}
                            <Home className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <Separator />

                {/* Daily Meal Plans */}
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground mb-2">
                    Showing {mealPlanDays.length} days of meal planning
                  </div>
                  {mealPlanDays.map((dayKey, dayIndex) => {
                    const dayPlan = generatedPlan.meal_plan[dayKey];
                    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
                    const dayMeals = mealTypes.filter(type => dayPlan && dayPlan[type as keyof DayPlan]);
                    
                    if (!dayPlan) {
                      return null;
                    }
                    
                    return (
                      <Collapsible key={`${dayKey}-${dayIndex}`} defaultOpen={dayIndex < 2}>
                        <CollapsibleTrigger 
                          onClick={() => toggleDay(dayIndex)}
                          className="flex items-center justify-between w-full p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-lg font-semibold" style={{ color: '#50C878' }}>
                              {getDayNameFromKey(dayKey)}
                            </div>
                            <Badge variant="secondary">{dayMeals.length} meals</Badge>
                          </div>
                          {openDays.has(dayIndex) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2 space-y-2">
                          {dayMeals.map((mealType) => {
                            const meal = dayPlan[mealType as keyof DayPlan];
                            if (!meal) return null;
                            
                            const mealId = `${dayKey}-${mealType}`;
                            const isExpanded = expandedMeals.has(mealId);
                            
                            return (
                              <div key={mealType} className="p-3 border rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <div className="text-xs font-medium text-blue-500 uppercase mb-1">{mealType}</div>
                                    <h4 className="font-medium">{meal.title}</h4>
                                  </div>
                                  <div className="flex gap-1">
                                    <Badge variant="outline">{meal.cook_time_minutes}min</Badge>
                                    <Badge variant="outline">Difficulty {meal.difficulty}</Badge>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2 mb-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleMealIngredients(mealId)}
                                    className="h-8 p-0 hover:bg-transparent"
                                  >
                                    <List className="h-4 w-4 mr-1" />
                                    <span className="text-xs">
                                      {isExpanded ? 'Hide' : 'Show'} Ingredients ({meal.ingredients.length})
                                    </span>
                                    {isExpanded ? <ChevronDown className="h-3 w-3 ml-1" /> : <ChevronRight className="h-3 w-3 ml-1" />}
                                  </Button>
                                </div>

                                {isExpanded ? (
                                  <div className="space-y-2 mb-2">
                                    <div className="bg-gray-50 p-3 rounded-md">
                                      <h5 className="text-xs font-medium text-gray-700 mb-2">Ingredients:</h5>
                                      <ul className="text-sm space-y-1">
                                        {meal.ingredients.map((ingredient, idx) => (
                                          <li key={idx} className="flex items-start">
                                            <span className="text-gray-400 mr-2">•</span>
                                            <span>{ingredient}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                    {meal.instructions && meal.instructions.length > 0 && (
                                      <div className="bg-blue-50 p-3 rounded-md">
                                        <h5 className="text-xs font-medium text-blue-700 mb-2">Instructions:</h5>
                                        <ol className="text-sm space-y-1">
                                          {meal.instructions.slice(0, 3).map((instruction, idx) => (
                                            <li key={idx} className="flex items-start">
                                              <span className="text-blue-400 mr-2 font-medium">{idx + 1}.</span>
                                              <span>{instruction}</span>
                                            </li>
                                          ))}
                                          {meal.instructions.length > 3 && (
                                            <li className="text-blue-600 text-xs">... and {meal.instructions.length - 3} more steps</li>
                                          )}
                                        </ol>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {meal.ingredients.slice(0, 3).join(", ")}
                                    {meal.ingredients.length > 3 && "..."}
                                  </p>
                                )}
                                
                                {meal.nutrition && (
                                  <div className="flex gap-4 text-xs text-muted-foreground">
                                    <span>{meal.nutrition.calories} cal</span>
                                    <span>{meal.nutrition.protein_g}g protein</span>
                                    <span>{meal.nutrition.carbs_g}g carbs</span>
                                    <span>{meal.nutrition.fat_g}g fat</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </div>

                {/* Cost Optimization */}
                {generatedPlan.estimated_savings && generatedPlan.estimated_savings > 0 && (
                  <div className="mt-6 space-y-2">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <span className="text-green-500 font-bold">$</span>
                      Smart Shopping Savings
                    </h3>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-lg font-bold text-green-800">
                        Estimated savings: ${generatedPlan.estimated_savings.toFixed(2)}
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        Through ingredient reuse and bulk buying opportunities
                      </p>
                    </div>
                  </div>
                )}

                {/* Prep Tips */}
                {generatedPlan.prep_tips && generatedPlan.prep_tips.length > 0 && (
                  <div className="mt-6 space-y-2">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <ChefHat className="h-5 w-5 text-blue-500" />
                      Meal Prep Tips
                    </h3>
                    <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                      {generatedPlan.prep_tips.map((tip, index) => (
                        <p key={index} className="text-sm text-blue-800">• {tip}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Past Generations */}
      {/* Debug Section - Remove this in production */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <QuickAuthDebug />
        <div>
          <MealPlanDebugger />
        </div>
      </div>

      <PastGenerations onLoadPlan={(mealPlan) => {
        // TODO: Implement loading a past plan into the current form
        console.log('Loading past plan:', mealPlan);
        toast({
          title: "Plan loaded", 
          description: "Past meal plan has been loaded.",
        });
      }} />
    </div>
  );
}