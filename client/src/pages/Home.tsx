import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { safeApiRequest } from "@/lib/queryClient";

import { 
  ChefHat,
  Loader2,
  Edit,
  Save,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Send,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  BookOpen,
  Activity,
  Search,
  GripVertical,
  Move,
  Egg,
  Beef,
  Fish,
  Carrot,
  Apple,
  Coffee,
  Pizza,
  Salad,
  Sandwich,
  Cookie,
  Soup,
  Flame,
  Star,
  Heart,
  Wheat,
  Droplets,
  Drumstick,
  Ham,
  Square,
  Leaf,
  Circle,
  IceCream,
  Wine,
  Beer,
  Cake,
  Croissant,
  Milk,
  Check,
  CheckCircle
} from "lucide-react";

// Import React Icons for more specific food types
import { FaHamburger, FaPizzaSlice, FaBacon } from "react-icons/fa";
import { 
  GiMeat, GiSteak, GiChickenLeg, GiChicken, GiSausage, 
  GiTomato, GiAsparagus, GiFruitBowl,
  GiBread, GiBarbecue, GiCakeSlice
} from "react-icons/gi";
import { MdRamenDining, MdLocalBar, MdIcecream } from "react-icons/md";
import { TbBurger } from "react-icons/tb";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface Meal {
  title: string;
  cook_time_minutes: number;
  difficulty: number;
  ingredients: string[];
  instructions: string[];
  nutrition?: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
}

interface DayMeals {
  breakfast?: Meal;
  lunch?: Meal;
  dinner?: Meal;
  snack?: Meal;
}

interface MealPlan {
  id: number;
  name: string;
  description: string;
  mealPlan: { [key: string]: DayMeals };
  createdAt: string;
  updatedAt: string;
}

interface MealCompletion {
  id: number;
  user_id: number;
  meal_plan_id: number;
  day_key: string;
  meal_type: string;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function Home() {
  const [currentPlan, setCurrentPlan] = useState<MealPlan | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMeal, setEditingMeal] = useState<{ dayKey: string; mealType: string; meal: Meal } | null>(null);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [draggedMeal, setDraggedMeal] = useState<{ dayKey: string; mealType: string; meal: Meal } | null>(null);
  const [draggedDay, setDraggedDay] = useState<{ dayKey: string; dayMeals: DayMeals } | null>(null);
  const [dayOrder, setDayOrder] = useState<string[]>([]);
  const [findButtonLoading, setFindButtonLoading] = useState<string | null>(null); // STEP 4.1: Loading state for Find button
  const [completions, setCompletions] = useState<MealCompletion[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch the most recent meal plan
  const { data: mealPlans, isLoading } = useQuery({
    queryKey: ['/api/meal-plans/saved'],
  });

  // Fetch meal completions for the current plan
  const { data: mealCompletions } = useQuery({
    queryKey: [`/api/meal-plans/${currentPlan?.id}/completions`],
    enabled: !!currentPlan?.id,
  });

  // Set the current plan to the most recent one (excluding completed plans)
  useEffect(() => {
    if (mealPlans && Array.isArray(mealPlans) && mealPlans.length > 0) {
      // Filter out completed plans
      const incompletePlans = mealPlans.filter(plan => {
        const normalizedPlan = {
          ...plan,
          mealPlan: plan.meal_plan || plan.mealPlan || {}
        };
        return !isMealPlanCompleted(normalizedPlan);
      });
      
      if (incompletePlans.length > 0) {
        const plan = incompletePlans[0];
        // Fix the data structure - convert meal_plan to mealPlan for consistency
        const normalizedPlan = {
          ...plan,
          mealPlan: plan.meal_plan || plan.mealPlan || {}
        };
        setCurrentPlan(normalizedPlan);
        // Initialize day order
        const days = Object.keys(normalizedPlan.mealPlan).sort();
        setDayOrder(days);
      } else {
        // All plans are completed
        setCurrentPlan(null);
        setDayOrder([]);
      }
    }
  }, [mealPlans, mealCompletions]);

  // Update completions when data changes
  useEffect(() => {
    if (mealCompletions && Array.isArray(mealCompletions)) {
      setCompletions(mealCompletions);
    }
  }, [mealCompletions]);

  // Update meal plan mutation
  const updateMealPlanMutation = useMutation({
    mutationFn: async ({ id, name, description, mealPlan }: { id: number; name: string; description: string; mealPlan: any }) => {
      return await safeApiRequest(`/api/meal-plans/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, description, mealPlan }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meal-plans/saved'] });
      toast({
        title: "Success",
        description: "Meal plan updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update meal plan",
        variant: "destructive",
      });
    },
  });

  // Toggle meal completion mutation
  const toggleMealCompletionMutation = useMutation({
    mutationFn: async ({ dayKey, mealType }: { dayKey: string; mealType: string }) => {
      if (!currentPlan?.id) throw new Error("No meal plan selected");
      return await safeApiRequest(`/api/meal-plans/${currentPlan.id}/completions/toggle`, {
        method: 'POST',
        body: JSON.stringify({ dayKey, mealType }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/meal-plans/${currentPlan?.id}/completions`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update meal completion",
        variant: "destructive",
      });
    },
  });

  // Complete entire meal plan mutation - REMOVED per user request
  // const completeMealPlanMutation = useMutation({
  //   mutationFn: async () => {
  //     if (!currentPlan?.id) throw new Error("No meal plan selected");
  //     return await safeApiRequest(`/api/meal-plans/${currentPlan.id}/complete`, {
  //       method: 'POST',
  //     });
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['/api/meal-plans/saved'] });
  //     toast({
  //       title: "Plan Completed! 🎉",
  //       description: "Congratulations! Your meal plan has been completed and removed from your active plans.",
  //     });
  //   },
  //   onError: (error) => {
  //     toast({
  //       title: "Error",
  //       description: "Failed to complete meal plan",
  //       variant: "destructive",
  //     });
  //   },
  // });

  const handleSavePlan = async () => {
    if (!currentPlan) return;

    await updateMealPlanMutation.mutateAsync({
      id: currentPlan.id,
      name: currentPlan.name,
      description: currentPlan.description,
      mealPlan: currentPlan.mealPlan,
    });

    setIsEditing(false);
  };

  // Helper function to check if a meal is completed
  const isMealCompleted = (dayKey: string, mealType: string): boolean => {
    return completions.some(completion => 
      completion.day_key === dayKey && 
      completion.meal_type === mealType && 
      completion.is_completed
    );
  };

  // Helper function to check if all meals in a day are completed
  const isDayCompleted = (dayKey: string, dayMeals: DayMeals): boolean => {
    const mealTypes = Object.keys(dayMeals);
    if (mealTypes.length === 0) return false;
    
    return mealTypes.every(mealType => isMealCompleted(dayKey, mealType));
  };

  // Helper function to get completion count for a day
  const getDayCompletionCount = (dayKey: string, dayMeals: DayMeals): { completed: number; total: number } => {
    const mealTypes = Object.keys(dayMeals);
    const completed = mealTypes.filter(mealType => isMealCompleted(dayKey, mealType)).length;
    return { completed, total: mealTypes.length };
  };

  // Helper function to check if entire meal plan is completed
  const isMealPlanCompleted = (plan: MealPlan): boolean => {
    if (!plan?.mealPlan) return false;
    
    const allDays = Object.keys(plan.mealPlan);
    if (allDays.length === 0) return false;
    
    return allDays.every(dayKey => {
      const dayMeals = plan.mealPlan[dayKey];
      return isDayCompleted(dayKey, dayMeals);
    });
  };

  // Handle toggling meal completion
  const handleToggleMealCompletion = async (dayKey: string, mealType: string) => {
    await toggleMealCompletionMutation.mutateAsync({ dayKey, mealType });
    
    // Check if this completion means the day is now complete
    if (currentPlan) {
      const dayMeals = currentPlan.mealPlan[dayKey];
      if (dayMeals) {
        const willBeCompleted = !isMealCompleted(dayKey, mealType);
        const otherMealsCompleted = Object.keys(dayMeals)
          .filter(mt => mt !== mealType)
          .every(mt => isMealCompleted(dayKey, mt));
        
        if (willBeCompleted && otherMealsCompleted) {
          toast({
            title: "Day Complete! 🎉",
            description: `All meals for ${dayKey.replace('_', ' ')} are now completed!`,
          });
          
          // Check if this was the last day needed to complete the entire plan
          setTimeout(() => {
            const allDaysCompleted = Object.keys(currentPlan.mealPlan).every(dk => {
              if (dk === dayKey) return true; // This day just got completed
              return isDayCompleted(dk, currentPlan.mealPlan[dk]);
            });
            
            if (allDaysCompleted) {
              toast({
                title: "Meal Plan Complete! 🎊",
                description: "Congratulations! You've completed your entire meal plan.",
              });
            }
          }, 500);
        }
      }
    }
  };

  // Comprehensive 200+ emoji food icon system - Priority: Meal Name → Meat → Vegetable
  const getFoodIcon = (meal: Meal, mealType: string) => {
    const title = meal.title?.toLowerCase() || '';
    const ingredients = meal.ingredients?.join(' ').toLowerCase() || '';
    const allText = (title + ' ' + ingredients).toLowerCase();
    
    // ==================== PRIORITY 1: SPECIFIC MEAL NAMES ====================
    
    // BREAKFAST DISHES
    if (allText.includes('pancake')) return <span className="text-lg">🥞</span>;
    if (allText.includes('waffle')) return <span className="text-lg">🧇</span>;
    if (allText.includes('french toast')) return <span className="text-lg">🍞</span>;
    if (allText.includes('omelette') || allText.includes('omelet')) return <span className="text-lg">🍳</span>;
    if (allText.includes('scrambled egg')) return <span className="text-lg">🥚</span>;
    if (allText.includes('fried egg')) return <span className="text-lg">🍳</span>;
    if (allText.includes('benedict')) return <span className="text-lg">🥚</span>;
    if (allText.includes('cereal')) return <span className="text-lg">🥣</span>;
    if (allText.includes('oatmeal') || allText.includes('porridge')) return <span className="text-lg">🥣</span>;
    if (allText.includes('granola')) return <span className="text-lg">🥣</span>;
    if (allText.includes('smoothie')) return <span className="text-lg">🥤</span>;
    if (allText.includes('bagel')) return <span className="text-lg">🥯</span>;
    if (allText.includes('croissant')) return <span className="text-lg">🥐</span>;
    if (allText.includes('muffin')) return <span className="text-lg">🧁</span>;
    if (allText.includes('toast')) return <span className="text-lg">🍞</span>;
    
    // PASTA & NOODLE DISHES  
    if (allText.includes('spaghetti') || allText.includes('linguine') || allText.includes('fettuccine')) return <span className="text-lg">🍝</span>;
    if (allText.includes('pasta') || allText.includes('penne') || allText.includes('rigatoni')) return <span className="text-lg">🍝</span>;
    if (allText.includes('lasagna') || allText.includes('lasagne')) return <span className="text-lg">🍝</span>;
    if (allText.includes('carbonara') || allText.includes('alfredo') || allText.includes('marinara')) return <span className="text-lg">🍝</span>;
    if (allText.includes('ramen')) return <span className="text-lg">🍜</span>;
    if (allText.includes('pho')) return <span className="text-lg">🍜</span>;
    if (allText.includes('lo mein') || allText.includes('chow mein')) return <span className="text-lg">🍜</span>;
    if (allText.includes('pad thai')) return <span className="text-lg">🍜</span>;
    if (allText.includes('udon') || allText.includes('soba')) return <span className="text-lg">🍜</span>;
    if (allText.includes('mac and cheese') || allText.includes('macaroni')) return <span className="text-lg">🧀</span>;
    
    // MEXICAN/LATIN DISHES
    if (allText.includes('taco') || allText.includes('tacos')) return <span className="text-lg">🌮</span>;
    if (allText.includes('burrito')) return <span className="text-lg">🌯</span>;
    if (allText.includes('quesadilla')) return <span className="text-lg">🫓</span>;
    if (allText.includes('enchilada')) return <span className="text-lg">🌯</span>;
    if (allText.includes('fajita')) return <span className="text-lg">🌮</span>;
    if (allText.includes('tamale')) return <span className="text-lg">🫔</span>;
    if (allText.includes('nachos')) return <span className="text-lg">🧀</span>;
    if (allText.includes('guacamole')) return <span className="text-lg">🥑</span>;
    
    // PIZZA
    if (allText.includes('pizza')) return <span className="text-lg">🍕</span>;
    
    // ASIAN DISHES
    if (allText.includes('sushi')) return <span className="text-lg">🍣</span>;
    if (allText.includes('sashimi')) return <span className="text-lg">🍣</span>;
    if (allText.includes('tempura')) return <span className="text-lg">🍤</span>;
    if (allText.includes('teriyaki')) return <span className="text-lg">🍗</span>;
    if (allText.includes('kimchi')) return <span className="text-lg">🥬</span>;
    if (allText.includes('bibimbap')) return <span className="text-lg">🍚</span>;
    if (allText.includes('dumplings') || allText.includes('gyoza')) return <span className="text-lg">🥟</span>;
    if (allText.includes('spring roll')) return <span className="text-lg">🥢</span>;
    if (allText.includes('fried rice')) return <span className="text-lg">🍚</span>;
    if (allText.includes('curry')) return <span className="text-lg">🍛</span>;
    
    // AMERICAN CLASSICS
    if (allText.includes('burger') || allText.includes('hamburger')) return <span className="text-lg">🍔</span>;
    if (allText.includes('hot dog') || allText.includes('hotdog')) return <span className="text-lg">🌭</span>;
    if (allText.includes('bbq') || allText.includes('barbecue')) return <span className="text-lg">🍖</span>;
    if (allText.includes('ribs')) return <span className="text-lg">🍖</span>;
    if (allText.includes('brisket')) return <span className="text-lg">🍖</span>;
    if (allText.includes('meatloaf')) return <span className="text-lg">🍖</span>;
    if (allText.includes('meatball')) return <span className="text-lg">🍖</span>;
    if (allText.includes('chili')) return <span className="text-lg">🍲</span>;
    
    // SANDWICHES & WRAPS
    if (allText.includes('sandwich')) return <span className="text-lg">🥪</span>;
    if (allText.includes('sub') || allText.includes('hoagie')) return <span className="text-lg">🥪</span>;
    if (allText.includes('panini')) return <span className="text-lg">🥪</span>;
    if (allText.includes('grilled cheese')) return <span className="text-lg">🧀</span>;
    if (allText.includes('wrap')) return <span className="text-lg">🌯</span>;
    if (allText.includes('blt')) return <span className="text-lg">🥪</span>;
    
    // SOUPS & STEWS
    if (allText.includes('soup')) return <span className="text-lg">🍲</span>;
    if (allText.includes('stew')) return <span className="text-lg">🍲</span>;
    if (allText.includes('chowder')) return <span className="text-lg">🍲</span>;
    if (allText.includes('bisque')) return <span className="text-lg">🍲</span>;
    if (allText.includes('broth')) return <span className="text-lg">🍲</span>;
    if (allText.includes('minestrone')) return <span className="text-lg">🍲</span>;
    
    // SALADS
    if (allText.includes('caesar salad')) return <span className="text-lg">🥗</span>;
    if (allText.includes('greek salad')) return <span className="text-lg">🥗</span>;
    if (allText.includes('cobb salad')) return <span className="text-lg">🥗</span>;
    if (allText.includes('salad')) return <span className="text-lg">🥗</span>;
    
    // SEAFOOD DISHES
    if (allText.includes('fish and chips')) return <span className="text-lg">🍟</span>;
    if (allText.includes('lobster')) return <span className="text-lg">🦞</span>;
    if (allText.includes('crab')) return <span className="text-lg">🦀</span>;
    if (allText.includes('shrimp')) return <span className="text-lg">🍤</span>;
    if (allText.includes('scallop')) return <span className="text-lg">🐚</span>;
    if (allText.includes('oyster')) return <span className="text-lg">🦪</span>;
    
    // DESSERTS
    if (allText.includes('cake')) return <span className="text-lg">🍰</span>;
    if (allText.includes('pie')) return <span className="text-lg">🥧</span>;
    if (allText.includes('ice cream')) return <span className="text-lg">🍦</span>;
    if (allText.includes('cookie')) return <span className="text-lg">🍪</span>;
    if (allText.includes('brownie')) return <span className="text-lg">🍫</span>;
    if (allText.includes('donut') || allText.includes('doughnut')) return <span className="text-lg">🍩</span>;
    if (allText.includes('cheesecake')) return <span className="text-lg">🍰</span>;
    
    // ==================== PRIORITY 2: MEAT CHOICES ====================
    
    // BEEF
    if (allText.includes('steak') || allText.includes('ribeye') || allText.includes('sirloin')) return <span className="text-lg">🥩</span>;
    if (allText.includes('beef') || allText.includes('ground beef')) return <span className="text-lg">🥩</span>;
    
    // CHICKEN  
    if (allText.includes('chicken breast')) return <span className="text-lg">🍗</span>;
    if (allText.includes('chicken wings')) return <span className="text-lg">🍗</span>;
    if (allText.includes('fried chicken')) return <span className="text-lg">🍗</span>;
    if (allText.includes('chicken')) return <span className="text-lg">🍗</span>;
    
    // PORK
    if (allText.includes('bacon')) return <span className="text-lg">🥓</span>;
    if (allText.includes('ham')) return <span className="text-lg">🍖</span>;
    if (allText.includes('pork chop')) return <span className="text-lg">🍖</span>;
    if (allText.includes('sausage')) return <span className="text-lg">🌭</span>;
    if (allText.includes('pork')) return <span className="text-lg">🍖</span>;
    
    // FISH & SEAFOOD
    if (allText.includes('salmon')) return <span className="text-lg">🐟</span>;
    if (allText.includes('tuna')) return <span className="text-lg">🐟</span>;
    if (allText.includes('cod') || allText.includes('halibut')) return <span className="text-lg">🐟</span>;
    if (allText.includes('fish')) return <span className="text-lg">🐟</span>;
    
    // OTHER MEATS
    if (allText.includes('turkey')) return <span className="text-lg">🦃</span>;
    if (allText.includes('duck')) return <span className="text-lg">🦆</span>;
    if (allText.includes('lamb')) return <span className="text-lg">🐑</span>;
    
    // ==================== PRIORITY 3: PROMINENT VEGETABLES ====================
    
    // TOMATO-BASED
    if (allText.includes('tomato') || allText.includes('marinara')) return <span className="text-lg">🍅</span>;
    if (allText.includes('cherry tomato')) return <span className="text-lg">🍅</span>;
    
    // LEAFY GREENS
    if (allText.includes('spinach')) return <span className="text-lg">🥬</span>;
    if (allText.includes('lettuce') || allText.includes('romaine')) return <span className="text-lg">🥬</span>;
    if (allText.includes('arugula') || allText.includes('kale')) return <span className="text-lg">🥬</span>;
    if (allText.includes('cabbage')) return <span className="text-lg">🥬</span>;
    
    // ROOT VEGETABLES
    if (allText.includes('carrot')) return <span className="text-lg">🥕</span>;
    if (allText.includes('potato')) return <span className="text-lg">🥔</span>;
    if (allText.includes('sweet potato')) return <span className="text-lg">🍠</span>;
    if (allText.includes('onion')) return <span className="text-lg">🧅</span>;
    if (allText.includes('garlic')) return <span className="text-lg">🧄</span>;
    
    // CRUCIFEROUS
    if (allText.includes('broccoli')) return <span className="text-lg">🥦</span>;
    if (allText.includes('cauliflower')) return <span className="text-lg">🥦</span>;
    
    // PEPPERS
    if (allText.includes('bell pepper') || allText.includes('sweet pepper')) return <span className="text-lg">🫑</span>;
    if (allText.includes('jalapeño') || allText.includes('chili pepper')) return <span className="text-lg">🌶️</span>;
    if (allText.includes('pepper')) return <span className="text-lg">🫑</span>;
    
    // OTHER VEGETABLES  
    if (allText.includes('mushroom')) return <span className="text-lg">🍄</span>;
    if (allText.includes('corn')) return <span className="text-lg">🌽</span>;
    if (allText.includes('zucchini') || allText.includes('squash')) return <span className="text-lg">🥒</span>;
    if (allText.includes('cucumber')) return <span className="text-lg">🥒</span>;
    if (allText.includes('eggplant')) return <span className="text-lg">🍆</span>;
    if (allText.includes('avocado')) return <span className="text-lg">🥑</span>;
    if (allText.includes('asparagus')) return <span className="text-lg">🥬</span>;
    
    // FRUITS (used in savory dishes)
    if (allText.includes('apple')) return <span className="text-lg">🍎</span>;
    if (allText.includes('lemon')) return <span className="text-lg">🍋</span>;
    
    // LEGUMES & GRAINS
    if (allText.includes('black beans') || allText.includes('kidney beans')) return <span className="text-lg">🫘</span>;
    if (allText.includes('chickpea') || allText.includes('garbanzo')) return <span className="text-lg">🫘</span>;
    if (allText.includes('rice')) return <span className="text-lg">🍚</span>;
    
    // DAIRY & EGGS (fallback)
    if (allText.includes('cheese')) return <span className="text-lg">🧀</span>;
    if (allText.includes('egg')) return <span className="text-lg">🥚</span>;
    
    // BEVERAGES
    if (allText.includes('coffee')) return <span className="text-lg">☕</span>;
    if (allText.includes('tea')) return <span className="text-lg">🍵</span>;
    
    if (allText.includes('wine')) return <span className="text-lg">🍷</span>;
    if (allText.includes('beer')) return <span className="text-lg">🍺</span>;
    if (allText.includes('juice')) return <span className="text-lg">🧃</span>;
    
    // DEFAULT: Generic food icon
    return <span className="text-lg">🍽️</span>;
  };

  // Function to get difficulty stars
  const getDifficultyStars = (difficulty: number) => {
    const stars = [];
    const fullStars = Math.floor(difficulty);
    const hasHalf = difficulty % 1 !== 0;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="w-3 h-3 fill-yellow-400 text-yellow-400" />);
    }
    
    // Add half star if needed
    if (hasHalf) {
      stars.push(
        <div key="half" className="relative">
          <Star className="w-3 h-3 text-yellow-400" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      );
    }
    
    // Add empty stars
    const remaining = 5 - stars.length;
    for (let i = 0; i < remaining; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-3 h-3 text-gray-300" />);
    }
    
    return stars;
  };

  // Function to get nutrition color based on calories
  const getNutritionColor = (calories: number) => {
    if (calories < 300) return 'text-green-600 bg-green-50 border-green-200';
    if (calories < 500) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const handleEditMeal = (dayKey: string, mealType: string, meal: Meal) => {
    setEditingMeal({ dayKey, mealType, meal });
  };

  const handleSaveMeal = () => {
    if (!editingMeal || !currentPlan) return;

    const updatedPlan = { ...currentPlan };
    updatedPlan.mealPlan[editingMeal.dayKey][editingMeal.mealType as keyof DayMeals] = editingMeal.meal;
    
    setCurrentPlan(updatedPlan);
    setEditingMeal(null);
    setIsEditing(true);
  };

  const handleDeleteMeal = (dayKey: string, mealType: string) => {
    if (!currentPlan) return;

    const updatedPlan = { ...currentPlan };
    delete updatedPlan.mealPlan[dayKey][mealType as keyof DayMeals];
    
    setCurrentPlan(updatedPlan);
    setIsEditing(true);
  };

  const handleAddMeal = (dayKey: string, mealType: string) => {
    const newMeal: Meal = {
      title: `New ${mealType}`,
      cook_time_minutes: 30,
      difficulty: 3,
      ingredients: ['Add ingredients'],
      instructions: ['Add instructions'],
      nutrition: {
        calories: 0,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
      },
    };

    handleEditMeal(dayKey, mealType, newMeal);
  };

  const handleMealClick = (dayKey: string, mealType: string) => {
    if (isEditing) return;
    
    const expandedKey = `${dayKey}-${mealType}`;
    setExpandedMeal(expandedMeal === expandedKey ? null : expandedKey);
  };

  // Drag and drop handlers for meals
  const handleDragStart = (e: React.DragEvent, dayKey: string, mealType: string, meal: Meal) => {
    if (!isEditing) return;
    
    // Prevent event from bubbling up to parent day drag
    e.stopPropagation();
    
    setDraggedMeal({ dayKey, mealType, meal });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedMeal(null);
  };

  // Drag and drop handlers for entire days
  const handleDayDragStart = (e: React.DragEvent, dayKey: string, dayMeals: DayMeals) => {
    if (!isEditing) return;
    
    // Prevent event from interfering with child elements
    e.stopPropagation();
    
    setDraggedDay({ dayKey, dayMeals });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
    
    // Add visual feedback without affecting layout
    const element = e.currentTarget as HTMLElement;
    element.style.opacity = '0.5';
  };

  const handleDayDragEnd = (e: React.DragEvent) => {
    const element = e.currentTarget as HTMLElement;
    element.style.opacity = '1';
    setDraggedDay(null);
  };

  const handleDayDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDayDrop = (e: React.DragEvent, targetDayKey: string) => {
    e.preventDefault();
    
    if (!draggedDay || !currentPlan || !isEditing) return;
    
    // Don't do anything if dropping on same day
    if (draggedDay.dayKey === targetDayKey) {
      setDraggedDay(null);
      return;
    }

    // Find the positions in the current order
    const draggedIndex = dayOrder.indexOf(draggedDay.dayKey);
    const targetIndex = dayOrder.indexOf(targetDayKey);
    
    if (draggedIndex === -1 || targetIndex === -1) return;

    // Create new order by moving the dragged day to the target position
    const newOrder = [...dayOrder];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedDay.dayKey);
    
    setDayOrder(newOrder);
    setDraggedDay(null);
    
    toast({
      title: "Day Moved",
      description: `${draggedDay.dayKey.replace('_', ' ')} moved to position ${targetIndex + 1}`,
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetDayKey: string, targetMealType: string) => {
    e.preventDefault();
    
    if (!draggedMeal || !currentPlan || !isEditing) return;
    
    // Don't do anything if dropping on same location
    if (draggedMeal.dayKey === targetDayKey && draggedMeal.mealType === targetMealType) {
      setDraggedMeal(null);
      return;
    }

    const updatedPlan = { ...currentPlan };
    
    // Check if target already has a meal
    const targetMeal = updatedPlan.mealPlan[targetDayKey][targetMealType as keyof DayMeals];
    
    if (targetMeal) {
      // Swap meals
      updatedPlan.mealPlan[draggedMeal.dayKey][draggedMeal.mealType as keyof DayMeals] = targetMeal;
      updatedPlan.mealPlan[targetDayKey][targetMealType as keyof DayMeals] = draggedMeal.meal;
      
      toast({
        title: "Meals Swapped",
        description: `${draggedMeal.meal.title} and ${targetMeal.title} have been swapped`,
      });
    } else {
      // Move meal to empty slot
      delete updatedPlan.mealPlan[draggedMeal.dayKey][draggedMeal.mealType as keyof DayMeals];
      updatedPlan.mealPlan[targetDayKey][targetMealType as keyof DayMeals] = draggedMeal.meal;
      
      toast({
        title: "Meal Moved",
        description: `${draggedMeal.meal.title} moved to ${targetDayKey.replace('_', ' ')} ${targetMealType}`,
      });
    }
    
    setCurrentPlan(updatedPlan);
    setDraggedMeal(null);
  };

  const getDayCount = (mealPlan: { [key: string]: DayMeals }) => {
    return Object.keys(mealPlan).length;
  };

  const getMealCount = (mealPlan: { [key: string]: DayMeals }) => {
    return Object.values(mealPlan).reduce((total, dayMeals) => {
      return total + Object.values(dayMeals).filter(Boolean).length;
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!currentPlan) {
    // Check if there are any plans at all (completed or not)
    const hasAnyPlans = mealPlans && Array.isArray(mealPlans) && mealPlans.length > 0;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 pb-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            {hasAnyPlans ? (
              <>
                <div className="text-6xl mb-4">🎉</div>
                <h1 className="text-3xl font-bold mb-4">All Meal Plans Complete!</h1>
                <p className="text-muted-foreground mb-6">
                  Congratulations! You've completed all your meal plans. 
                  Time to create a new one for your next cooking adventure.
                </p>
                <Button onClick={() => window.location.href = '/meal-planner'}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Meal Plan
                </Button>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold mb-4">No Meal Plans Found</h1>
                <p className="text-muted-foreground mb-6">Create your first meal plan to get started.</p>
                <Button onClick={() => window.location.href = '/meal-planner'}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Meal Plan
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent leading-tight">Your Meal Plan</h1>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">{getDayCount(currentPlan.mealPlan)} days</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChefHat className="w-4 h-4" />
                  <span className="font-medium">{getMealCount(currentPlan.mealPlan)} meals</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Complete Plan Button - REMOVED per user request */}

              <Button
                variant={isEditing ? "default" : "outline"}
                onClick={() => setIsEditing(!isEditing)}
                className={`${isEditing ? "bg-purple-600 hover:bg-purple-700 shadow-lg" : "border-purple-600 text-purple-600 hover:bg-purple-50 shadow-md"} transition-all duration-200 px-4 sm:px-6 py-2.5 font-medium rounded-lg text-sm sm:text-base flex-1 sm:flex-none`}
              >
                {isEditing ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Save Changes</span>
                    <span className="sm:hidden">Save</span>
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Edit Plan</span>
                    <span className="sm:hidden">Edit</span>
                  </>
                )}
              </Button>

            </div>
          </div>

          {/* Plan Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  {isEditing ? (
                    <Input
                      value={currentPlan.name}
                      onChange={(e) => setCurrentPlan({ ...currentPlan, name: e.target.value })}
                      className="text-lg font-semibold mb-2"
                    />
                  ) : (
                    <CardTitle className="text-lg">{currentPlan.name}</CardTitle>
                  )}
                  {isEditing ? (
                    <Textarea
                      value={currentPlan.description}
                      onChange={(e) => setCurrentPlan({ ...currentPlan, description: e.target.value })}
                      className="text-sm"
                      rows={2}
                    />
                  ) : (
                    <CardDescription>{currentPlan.description}</CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Meal Calendar */}
        <div className="space-y-6">
          <div className="grid gap-6">
            {dayOrder.map((dayKey) => {
              if (!currentPlan?.mealPlan) return null;
              const dayMeals = currentPlan.mealPlan[dayKey];
              if (!dayMeals) return null;
              
              return (
                <Card 
                  key={dayKey}
                  draggable={isEditing}
                  onDragStart={(e) => handleDayDragStart(e, dayKey, dayMeals)}
                  onDragEnd={handleDayDragEnd}
                  onDragOver={handleDayDragOver}
                  onDrop={(e) => handleDayDrop(e, dayKey)}
                  className={`bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 ${isEditing ? 'border-2 border-dashed border-purple-300 hover:border-purple-400 transition-colors' : ''} ${draggedDay?.dayKey === dayKey ? 'opacity-50' : ''}`}
                >
                  <CardHeader>
                    <CardTitle className="text-xl font-bold capitalize flex items-center gap-3">
                      <Calendar className="w-5 h-5" style={{ color: '#50C878' }} />
                      <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        {dayKey.replace('_', ' ')}
                      </span>
                      
                      {/* Day completion status */}
                      {(() => {
                        const { completed, total } = getDayCompletionCount(dayKey, dayMeals);
                        const isComplete = isDayCompleted(dayKey, dayMeals);
                        return (
                          <Badge 
                            variant={isComplete ? "default" : "outline"}
                            className={`ml-2 text-xs font-medium ${
                              isComplete 
                                ? 'bg-green-100 text-green-700 border-green-200' 
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {isComplete ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Day Complete!
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 mr-1" />
                                {completed}/{total} meals
                              </>
                            )}
                          </Badge>
                        );
                      })()}

                      {isEditing && (
                        <Badge 
                          variant="secondary" 
                          className="ml-2 text-xs bg-purple-100 text-purple-700 border-purple-200 font-medium"
                        >
                          <GripVertical className="w-3 h-3 mr-1" />
                          Drag entire day to reorder
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={{ position: 'relative' }}>
                    {['breakfast', 'lunch', 'dinner'].map((mealType) => {
                      const meal = dayMeals[mealType as keyof DayMeals];
                      return (
                        <Card 
                          key={mealType} 
                          className={`bg-white/60 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200 ${isEditing && !meal ? 'border-dashed border-2 border-muted-foreground/20' : ''} ${draggedMeal?.dayKey === dayKey && draggedMeal?.mealType === mealType ? 'opacity-50' : ''}`}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, dayKey, mealType)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm capitalize flex items-center gap-2 font-semibold text-gray-700">
                                {mealType === 'breakfast' && <Coffee className="w-4 h-4 text-amber-600" />}
                                {mealType === 'lunch' && <Sandwich className="w-4 h-4 text-orange-600" />}
                                {mealType === 'dinner' && <ChefHat className="w-4 h-4 text-purple-600" />}
                                {mealType}
                              </CardTitle>
                              <div className="flex gap-1">
                                {meal && isEditing && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="drag-handle cursor-move"
                                      title="Drag to move meal"
                                      draggable
                                      onDragStart={(e) => handleDragStart(e, dayKey, mealType, meal)}
                                      onDragEnd={handleDragEnd}
                                    >
                                      <GripVertical className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleEditMeal(dayKey, mealType, meal)}
                                    >
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDeleteMeal(dayKey, mealType)}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            {meal ? (
                              <div className="space-y-3">
                                {/* Improved layout: Checkbox separate from clickable content */}
                                {!isEditing && (
                                  <div className="flex items-center justify-between pb-2 border-b border-muted/20">
                                    <div 
                                      className="flex items-center gap-3 p-2 -m-2 cursor-pointer hover:bg-muted/10 rounded-md transition-colors min-h-[44px]"
                                      onClick={(e) => {
                                        e.stopPropagation(); // Prevent triggering meal details
                                        handleToggleMealCompletion(dayKey, mealType);
                                      }}
                                    >
                                      <Checkbox
                                        checked={isMealCompleted(dayKey, mealType)}
                                        onCheckedChange={() => handleToggleMealCompletion(dayKey, mealType)}
                                        className="h-5 w-5" // Larger checkbox for better touch
                                        disabled={toggleMealCompletionMutation.isPending}
                                      />
                                      <span className="text-sm text-muted-foreground font-medium select-none">
                                        {isMealCompleted(dayKey, mealType) ? 'Completed' : 'Mark as done'}
                                      </span>
                                    </div>
                                    {isMealCompleted(dayKey, mealType) && (
                                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                        <Check className="w-3 h-3 mr-1" />
                                        Done
                                      </Badge>
                                    )}
                                  </div>
                                )}
                                
                                {/* Meal content - clickable to view details */}
                                <div 
                                  className={`cursor-pointer ${!isEditing ? 'hover:bg-muted/20 p-2 rounded-md -m-2 transition-colors' : ''}`}
                                  onClick={() => handleMealClick(dayKey, mealType)}
                                >
                                  {/* Food Icon and Title */}
                                  <div className="flex items-center gap-2 mb-2">
                                    {getFoodIcon(meal, mealType)}
                                    <h4 className={`font-semibold text-sm leading-tight ${
                                      isMealCompleted(dayKey, mealType) 
                                        ? 'text-green-700 line-through' 
                                        : 'text-gray-800'
                                    }`}>
                                      {meal.title}
                                    </h4>
                                  </div>
                                  
                                  {/* Enhanced Badges Row */}
                                  <div className="flex flex-wrap gap-1.5 mb-2">
                                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {meal.cook_time_minutes}m
                                    </Badge>
                                    
                                    {/* Difficulty Stars */}
                                    <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
                                      <span className="text-xs">Difficulty:</span>
                                      <div className="flex">{getDifficultyStars(meal.difficulty)}</div>
                                    </Badge>
                                  </div>
                                  
                                  {/* Enhanced Nutrition Display */}
                                  {meal.nutrition && (
                                    <div className={`text-xs px-2 py-1 rounded-full border inline-block font-medium ${getNutritionColor(meal.nutrition.calories)}`}>
                                      <Heart className="w-3 h-3 inline mr-1" />
                                      {meal.nutrition.calories} cal
                                      {meal.nutrition.protein_g && (
                                        <span className="ml-2">• {meal.nutrition.protein_g}g protein</span>
                                      )}
                                    </div>
                                  )}
                                  
                                  {!isEditing && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                                      <BookOpen className="w-3 h-3" />
                                      <span>Click to view recipe details</span>
                                      {expandedMeal === `${dayKey}-${mealType}` ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Expanded meal details */}
                                {!isEditing && expandedMeal === `${dayKey}-${mealType}` && (
                                  <div className="mt-4 p-4 bg-gradient-to-br from-muted/20 to-muted/40 rounded-lg space-y-4 border border-primary/20 shadow-sm">
                                    {/* Header with Search Button */}
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-semibold text-lg text-primary">Recipe Details</h4>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-xs border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                                        disabled={findButtonLoading === `${dayKey}-${mealType}`}
                                        onClick={() => {
                                          // STEP 7.3: Add fallback for missing meal data
                                          if (!meal || !meal.title) {
                                            toast({
                                              title: "Invalid Meal",
                                              description: "Meal data is missing. Please refresh the page.",
                                              variant: "destructive",
                                            });
                                            return;
                                          }
                                          
                                          // STEP 4.2: Set loading state
                                          const loadingKey = `${dayKey}-${mealType}`;
                                          setFindButtonLoading(loadingKey);
                                          
                                          // STEP 1.6: Add console logging to track ingredient availability
                                          console.log('Find button clicked for meal:', meal.title);
                                          console.log('Meal ingredients:', meal.ingredients);
                                          console.log('Ingredients type:', typeof meal.ingredients);
                                          console.log('Ingredients array?', Array.isArray(meal.ingredients));
                                          console.log('Ingredients length:', meal.ingredients?.length);
                                          
                                          // STEP 2: Enhanced search query construction
                                          let searchQuery = '';
                                          let mainIngredients = '';
                                          let queryComponents = [];
                                          
                                          // Base query with meal title
                                          queryComponents.push(meal.title);
                                          
                                          // Check if ingredients exist and handle edge cases
                                          if (meal.ingredients && Array.isArray(meal.ingredients) && meal.ingredients.length > 0) {
                                            // Normal case: has ingredients
                                            const availableIngredients = meal.ingredients.filter(ing => ing && ing.trim());
                                            if (availableIngredients.length > 0) {
                                              const topIngredients = availableIngredients.slice(0, 3);
                                              mainIngredients = topIngredients.join(', ');
                                              queryComponents.push(`recipe with ${mainIngredients}`);
                                              console.log('Using ingredients:', topIngredients);
                                            } else {
                                              // Empty ingredients array or all empty strings
                                              queryComponents.push('recipe');
                                              console.log('No valid ingredients found, using title only');
                                            }
                                          } else {
                                            // No ingredients property or not an array
                                            queryComponents.push('recipe');
                                            console.log('No ingredients property, using title only');
                                          }
                                          
                                          // STEP 2.4: Add cooking time hint for better YouTube results
                                          if (meal.cook_time_minutes) {
                                            if (meal.cook_time_minutes <= 15) {
                                              queryComponents.push('quick');
                                            } else if (meal.cook_time_minutes <= 30) {
                                              queryComponents.push('easy');
                                            }
                                            console.log('Cooking time:', meal.cook_time_minutes, 'minutes');
                                          }
                                          
                                          // STEP 2.5: Join components with spaces
                                          searchQuery = queryComponents.join(' ');
                                          
                                          // STEP 2.6: Validate query length (avoid overly long URLs)
                                          if (searchQuery.length > 100) {
                                            // Fallback to simpler query if too long
                                            searchQuery = `${meal.title} recipe`;
                                            console.log('Query too long, using simplified version');
                                          }
                                          
                                          // STEP 2.7: Handle special characters (basic cleanup)
                                          searchQuery = searchQuery.replace(/[^\w\s,-]/g, '').trim();
                                          console.log('Cleaned query:', searchQuery);
                                          
                                          // STEP 7.4: Add user feedback for error states - validate final query
                                          if (!searchQuery || searchQuery.length < 3) {
                                            setFindButtonLoading(null);
                                            toast({
                                              title: "Invalid Search Query",
                                              description: "Unable to create a proper search query. Please check the meal title.",
                                              variant: "destructive",
                                            });
                                            return;
                                          }
                                          
                                          console.log('Final search query:', searchQuery);
                                          
                                          // STEP 2.2: Add immediate pre-loading state before navigation
                                          toast({
                                            title: "Finding Recipe",
                                            description: `Auto-generating recipe for "${meal.title}"...`,
                                          });
                                          
                                          // STEP 2.1: Enhanced error handling for immediate navigation
                                          try {
                                            const url = `/search?q=${encodeURIComponent(searchQuery)}&mode=detailed`;
                                            console.log('Navigating immediately to:', url);
                                            window.location.href = url;
                                          } catch (navError) {
                                            console.error('Navigation error:', navError);
                                            setFindButtonLoading(null);
                                            toast({
                                              title: "Navigation Failed",
                                              description: "Failed to navigate to search page. Please try again.",
                                              variant: "destructive",
                                            });
                                          }
                                        }}
                                      >
                                        {findButtonLoading === `${dayKey}-${mealType}` ? (
                                          <>
                                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                            Finding...
                                          </>
                                        ) : (
                                          <>
                                            <Search className="w-3 h-3 mr-1" />
                                            Find
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                    
                                    {/* Ingredients */}
                                    <div>
                                      <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                                        <ShoppingCart className="w-4 h-4" />
                                        Ingredients
                                      </h5>
                                      <ul className="text-xs space-y-1 text-muted-foreground">
                                        {meal.ingredients?.map((ingredient, index) => (
                                          <li key={index} className="flex items-start gap-2">
                                            <span className="w-1 h-1 bg-primary rounded-full mt-1.5 flex-shrink-0"></span>
                                            {ingredient}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                    
                                    {/* Instructions */}
                                    <div>
                                      <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                                        <BookOpen className="w-4 h-4" />
                                        Instructions
                                      </h5>
                                      <ol className="text-xs space-y-2 text-muted-foreground">
                                        {meal.instructions?.map((instruction, index) => (
                                          <li key={index} className="flex gap-2">
                                            <span className="flex-shrink-0 w-4 h-4 bg-primary/10 text-primary rounded-full text-xs flex items-center justify-center font-medium">
                                              {index + 1}
                                            </span>
                                            {instruction}
                                          </li>
                                        ))}
                                      </ol>
                                    </div>
                                    
                                    {/* Nutrition */}
                                    {meal.nutrition && (
                                      <div>
                                        <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                                          <Activity className="w-4 h-4" />
                                          Nutrition
                                        </h5>
                                        <div className="grid grid-cols-2 gap-2">
                                          <div className="text-xs bg-background/50 p-2 rounded">
                                            <div className="font-medium">Calories</div>
                                            <div className="text-muted-foreground">{meal.nutrition.calories}</div>
                                          </div>
                                          <div className="text-xs bg-background/50 p-2 rounded">
                                            <div className="font-medium">Protein</div>
                                            <div className="text-muted-foreground">{meal.nutrition.protein_g}g</div>
                                          </div>
                                          <div className="text-xs bg-background/50 p-2 rounded">
                                            <div className="font-medium">Carbs</div>
                                            <div className="text-muted-foreground">{meal.nutrition.carbs_g}g</div>
                                          </div>
                                          <div className="text-xs bg-background/50 p-2 rounded">
                                            <div className="font-medium">Fat</div>
                                            <div className="text-muted-foreground">{meal.nutrition.fat_g}g</div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-6">
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
                                  <div className="text-gray-400 mb-2">
                                    {mealType === 'breakfast' && <Coffee className="w-8 h-8 mx-auto" />}
                                    {mealType === 'lunch' && <Sandwich className="w-8 h-8 mx-auto" />}
                                    {mealType === 'dinner' && <ChefHat className="w-8 h-8 mx-auto" />}
                                    {!['breakfast', 'lunch', 'dinner'].includes(mealType) && <Plus className="w-8 h-8 mx-auto" />}
                                  </div>
                                  <p className="text-xs text-gray-500 font-medium">No {mealType} planned</p>
                                  {isEditing && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="mt-2 text-xs bg-purple-50 text-purple-600 hover:bg-purple-100"
                                      onClick={() => handleAddMeal(dayKey, mealType)}
                                    >
                                      <Plus className="w-3 h-3 mr-1" />
                                      Add {mealType}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit Meal Dialog */}
      {editingMeal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Meal</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  value={editingMeal.meal.title}
                  onChange={(e) => setEditingMeal({
                    ...editingMeal,
                    meal: { ...editingMeal.meal, title: e.target.value }
                  })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Cook Time (minutes)</label>
                  <Input
                    type="number"
                    value={editingMeal.meal.cook_time_minutes}
                    onChange={(e) => setEditingMeal({
                      ...editingMeal,
                      meal: { ...editingMeal.meal, cook_time_minutes: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Difficulty (1-5)</label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={editingMeal.meal.difficulty}
                    onChange={(e) => setEditingMeal({
                      ...editingMeal,
                      meal: { ...editingMeal.meal, difficulty: parseInt(e.target.value) || 1 }
                    })}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Ingredients (one per line)</label>
                <Textarea
                  value={editingMeal.meal.ingredients.join('\n')}
                  onChange={(e) => setEditingMeal({
                    ...editingMeal,
                    meal: { ...editingMeal.meal, ingredients: e.target.value.split('\n').filter(Boolean) }
                  })}
                  rows={4}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Instructions (one per line)</label>
                <Textarea
                  value={editingMeal.meal.instructions.join('\n')}
                  onChange={(e) => setEditingMeal({
                    ...editingMeal,
                    meal: { ...editingMeal.meal, instructions: e.target.value.split('\n').filter(Boolean) }
                  })}
                  rows={4}
                />
              </div>
              
              {editingMeal.meal.nutrition && (
                <div>
                  <label className="block text-sm font-medium mb-2">Nutrition</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Calories</label>
                      <Input
                        type="number"
                        value={editingMeal.meal.nutrition.calories}
                        onChange={(e) => setEditingMeal({
                          ...editingMeal,
                          meal: { 
                            ...editingMeal.meal, 
                            nutrition: { 
                              ...editingMeal.meal.nutrition!, 
                              calories: parseInt(e.target.value) || 0 
                            }
                          }
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Protein (g)</label>
                      <Input
                        type="number"
                        value={editingMeal.meal.nutrition.protein_g}
                        onChange={(e) => setEditingMeal({
                          ...editingMeal,
                          meal: { 
                            ...editingMeal.meal, 
                            nutrition: { 
                              ...editingMeal.meal.nutrition!, 
                              protein_g: parseInt(e.target.value) || 0 
                            }
                          }
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Carbs (g)</label>
                      <Input
                        type="number"
                        value={editingMeal.meal.nutrition.carbs_g}
                        onChange={(e) => setEditingMeal({
                          ...editingMeal,
                          meal: { 
                            ...editingMeal.meal, 
                            nutrition: { 
                              ...editingMeal.meal.nutrition!, 
                              carbs_g: parseInt(e.target.value) || 0 
                            }
                          }
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Fat (g)</label>
                      <Input
                        type="number"
                        value={editingMeal.meal.nutrition.fat_g}
                        onChange={(e) => setEditingMeal({
                          ...editingMeal,
                          meal: { 
                            ...editingMeal.meal, 
                            nutrition: { 
                              ...editingMeal.meal.nutrition!, 
                              fat_g: parseInt(e.target.value) || 0 
                            }
                          }
                        })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setEditingMeal(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveMeal}>
                <Save className="w-4 h-4 mr-2" />
                Save Meal
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}