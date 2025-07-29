import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CalendarDays, Clock, ChefHat, ShoppingCart, Target, ChevronDown, ChevronRight, ExternalLink, Utensils } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useProfileSystem } from "@/hooks/useProfileSystem";
import ProfileSystemIndicator from "@/components/ProfileSystemIndicator";

interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  cook_time_minutes: number;
  difficulty: number;
  nutrition_info?: {
    calories: number;
    protein_g: number;
    fat_g: number;
    carbs_g: number;
  };
}

interface PlanResponse {
  recipes: Recipe[];
  shopping_list: string[];
}

export default function MealPlanner() {
  // Profile system detection
  const { isSmartProfileEnabled } = useProfileSystem();
  
  const [cookTime, setCookTime] = useState([30]);
  const [difficulty, setDifficulty] = useState([3.0]);
  const [nutritionGoal, setNutritionGoal] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");
  const [numDays, setNumDays] = useState([7]);
  const [mealsPerDay, setMealsPerDay] = useState([3]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [openDays, setOpenDays] = useState<Set<number>>(new Set());
  const [shoppingUrl, setShoppingUrl] = useState<string>("");

  const handleGeneratePlan = async () => {
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
            maxDifficulty: difficulty[0], // Use raw 1-5 scale (backend expects this)
            familySize: 2, // Default for this simple interface
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
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            numDays: numDays[0],
            mealsPerDay: mealsPerDay[0],
            cookTime: cookTime[0],
            difficulty: difficulty[0],
            nutritionGoal: nutritionGoal || 'general_wellness',
            dietaryRestrictions: dietaryRestrictions || '',
            useIntelligentPrompt: true
          })
        });
      }

      if (!response.ok) throw new Error('Failed to generate meal plan');
      
      const data = await response.json();
      setGeneratedPlan(data);
    } catch (error) {
      console.error('Error generating meal plan:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateShoppingList = async () => {
    if (!generatedPlan?.shopping_list) return;
    
    try {
      const response = await fetch('/api/instacart/create-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: generatedPlan.shopping_list,
          recipeName: "Weekly Meal Plan Shopping List"
        })
      });

      if (!response.ok) throw new Error('Failed to create shopping list');
      
      const data = await response.json();
      setShoppingUrl(data.shopping_url);
      // Use window.location.href instead of window.open to avoid popup blockers
      window.location.href = data.shopping_url;
    } catch (error) {
      console.error('Error creating shopping list:', error);
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

  const getDayName = (index: number) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[index % 7];
  };

  const getDifficultyLabel = (level: number) => {
    if (level <= 2) return "Beginner";
    if (level <= 3.5) return "Intermediate"; 
    return "Advanced";
  };

  const nutritionGoals = [
    { value: "weight_loss", label: "Weight Loss" },
    { value: "weight_maintenance", label: "Weight Maintenance" },
    { value: "muscle_gain", label: "Muscle Gain" },
    { value: "metabolic_health", label: "Metabolic Health" },
    { value: "energy_performance", label: "Energy & Performance" },
    { value: "digestive_health", label: "Digestive Health" },
    { value: "general_wellness", label: "General Wellness" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 pb-20">
      <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
          AI Weekly Meal Planner
        </h1>
        <p className="text-muted-foreground text-lg">
          Get personalized meal plans with smart shopping lists
        </p>
        <div className="flex justify-center mt-3">
          <ProfileSystemIndicator />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Planning Controls */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-orange-500" />
              Plan Your Week
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Number of Days */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-blue-500" />
                <label className="font-medium">Plan Duration: {numDays[0]} days</label>
              </div>
              <Slider 
                min={3} max={14} step={1} 
                value={numDays} 
                onValueChange={setNumDays}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>3 days</span>
                <span>14 days</span>
              </div>
            </div>

            {/* Meals Per Day */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Utensils className="h-4 w-4 text-purple-500" />
                <label className="font-medium">Meals per day: {mealsPerDay[0]}</label>
              </div>
              <Slider 
                min={1} max={5} step={1} 
                value={mealsPerDay} 
                onValueChange={setMealsPerDay}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 meal</span>
                <span>5 meals</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Total meals: {numDays[0] * mealsPerDay[0]}
              </div>
            </div>

            {/* Nutrition Goal */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                <label className="font-medium">Nutrition Goal</label>
              </div>
              <Select value={nutritionGoal} onValueChange={setNutritionGoal}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your nutrition goal" />
                </SelectTrigger>
                <SelectContent>
                  {nutritionGoals.map((goal) => (
                    <SelectItem key={goal.value} value={goal.value}>
                      {goal.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cook Time */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-500" />
                <label className="font-medium">Max cook time: {cookTime[0]} minutes</label>
              </div>
              <Slider 
                min={10} max={120} step={5} 
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
                <ChefHat className="h-4 w-4 text-orange-500" />
                <label className="font-medium">
                  Difficulty: {difficulty[0]}/5 ({getDifficultyLabel(difficulty[0])})
                </label>
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
            </div>

            {/* Cultural Cuisine Integration */}
            <div className="space-y-2">
              <label className="font-medium">Cultural Cuisine Integration</label>
              <div className="text-sm text-muted-foreground">
                🌍 Your cultural preferences from Profile will automatically influence meal suggestions
              </div>
            </div>

            {/* Dietary Restrictions */}
            <div className="space-y-2">
              <label className="font-medium">Dietary Restrictions</label>
              <Input 
                placeholder="e.g., vegetarian, gluten-free, low-carb" 
                value={dietaryRestrictions} 
                onChange={(e) => setDietaryRestrictions(e.target.value)}
                className="w-full"
              />
            </div>

            <Button 
              onClick={handleGeneratePlan} 
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              size="lg"
            >
              {isGenerating ? "Generating Plan..." : "Generate Weekly Plan"}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          {generatedPlan && (
            <>
              {/* Shopping List with Instacart Integration */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5 text-blue-500" />
                      Shopping List
                    </div>
                    <Button 
                      onClick={handleCreateShoppingList}
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Shop with Instacart
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-2">
                    {generatedPlan.shopping_list.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                  {shoppingUrl && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        ✅ Shopping list created! <a href={shoppingUrl} target="_blank" rel="noopener noreferrer" className="underline">Open in Instacart</a>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Calendar-Style Meal Plan */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <CalendarDays className="h-6 w-6 text-orange-500" />
                  Your {numDays[0]}-Day Meal Calendar
                </h2>
                
                <div className="grid grid-cols-1 gap-3">
                  {generatedPlan.meal_plan && Object.entries(generatedPlan.meal_plan).map(([dayKey, dayMeals], i) => (
                    <Card key={i} className="shadow-md hover:shadow-lg transition-all duration-200">
                      <Collapsible open={openDays.has(i)} onOpenChange={() => toggleDay(i)}>
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex flex-col items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl">
                                  <span className="text-xs font-medium text-orange-600 uppercase">
                                    {getDayName(i).slice(0, 3)}
                                  </span>
                                  <span className="text-lg font-bold text-orange-800">
                                    {i + 1}
                                  </span>
                                </div>
                                <div>
                                  <CardTitle className="text-xl text-left">{getDayName(i)}</CardTitle>
                                  <p className="text-sm text-gray-600">{mealsPerDay[0]} meals planned</p>
                                  <div className="flex gap-2 mt-1">
                                    {Object.entries(dayMeals as any).map(([mealType, _]) => (
                                      <Badge key={mealType} variant="secondary" className="text-xs capitalize">
                                        {mealType}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {openDays.has(i) ? 
                                  <ChevronDown className="h-5 w-5 text-gray-500" /> : 
                                  <ChevronRight className="h-5 w-5 text-gray-500" />
                                }
                              </div>
                            </div>
                          </CardHeader>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent>
                          <CardContent className="pt-0 space-y-6">
                            <Separator />
                            
                            {/* Meals for this day */}
                            <div className="space-y-4">
                              {Object.entries(dayMeals as any).map(([mealType, meal]: [string, any]) => (
                                <div key={mealType} className="border rounded-lg p-4 bg-gray-50">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold text-lg capitalize flex items-center gap-2">
                                      <Utensils className="h-4 w-4" />
                                      {mealType}
                                    </h4>
                                    <div className="flex gap-2">
                                      <Badge variant="secondary" className="text-xs">
                                        {meal.cook_time_minutes} min
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        Difficulty {meal.difficulty}/5
                                      </Badge>
                                    </div>
                                  </div>
                                  
                                  <h5 className="font-medium text-lg mb-3">{meal.title}</h5>
                                  
                                  <div className="grid md:grid-cols-2 gap-4">
                                    {/* Ingredients */}
                                    <div>
                                      <h6 className="font-medium mb-2 text-green-700">Ingredients:</h6>
                                      <div className="space-y-1">
                                        {meal.ingredients.map((ingredient: string, j: number) => (
                                          <div key={j} className="flex items-center gap-2 p-2 bg-green-50 rounded text-sm">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                            {ingredient}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    
                                    {/* Instructions */}
                                    <div>
                                      <h6 className="font-medium mb-2 text-blue-700">Instructions:</h6>
                                      <div className="space-y-2">
                                        {meal.instructions.map((step: string, j: number) => (
                                          <div key={j} className="flex gap-2 p-2 bg-blue-50 rounded text-sm">
                                            <div className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                              {j + 1}
                                            </div>
                                            {step}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Nutrition */}
                                  {meal.nutrition && (
                                    <div className="mt-4 pt-3 border-t">
                                      <h6 className="font-medium mb-2 text-purple-700">Nutrition:</h6>
                                      <div className="grid grid-cols-4 gap-2">
                                        <div className="text-center p-2 bg-purple-50 rounded">
                                          <div className="font-bold text-purple-700">{meal.nutrition.calories}</div>
                                          <div className="text-xs text-purple-600">Cal</div>
                                        </div>
                                        <div className="text-center p-2 bg-green-50 rounded">
                                          <div className="font-bold text-green-700">{meal.nutrition.protein_g}g</div>
                                          <div className="text-xs text-green-600">Protein</div>
                                        </div>
                                        <div className="text-center p-2 bg-blue-50 rounded">
                                          <div className="font-bold text-blue-700">{meal.nutrition.carbs_g}g</div>
                                          <div className="text-xs text-blue-600">Carbs</div>
                                        </div>
                                        <div className="text-center p-2 bg-orange-50 rounded">
                                          <div className="font-bold text-orange-700">{meal.nutrition.fat_g}g</div>
                                          <div className="text-xs text-orange-600">Fat</div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </CollapsibleContent>
                      </Collapsible>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}

          {!generatedPlan && (
            <Card className="shadow-lg">
              <CardContent className="p-8 text-center">
                <ChefHat className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">Ready to Plan!</h3>
                <p className="text-muted-foreground">
                  Configure your preferences and generate a personalized meal plan with smart shopping lists.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}