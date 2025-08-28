import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, 
  CalendarDays, 
  Coffee, 
  Sun, 
  Moon, 
  Check,
  Loader2,
  ChefHat,
  Clock,
  X
} from "lucide-react";

interface Recipe {
  id?: string | number;
  title: string;
  description?: string;
  image_url?: string;
  time_minutes?: number;
  cuisine?: string;
  diet?: string;
  ingredients?: any[];
  instructions?: any[];
  nutrition_info?: any;
  video_id?: string;
  video_title?: string;
  video_channel?: string;
}

interface MealPlanSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe | null;
  onSuccess?: () => void;
}

interface MealSlot {
  dayNumber: number;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  isOccupied: boolean;
  currentRecipe?: any;
}

export function MealPlanSelectionModal({ isOpen, onClose, recipe, onSuccess }: MealPlanSelectionModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSlot, setSelectedSlot] = useState<MealSlot | null>(null);
  const [selectedNewDayMeal, setSelectedNewDayMeal] = useState<'breakfast' | 'lunch' | 'dinner'>('lunch');
  const [isAddingNewDay, setIsAddingNewDay] = useState(false);

  // Fetch user's current meal plans
  const { data: mealPlans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['/api/meal-plans'],
    queryFn: async () => {
      const response = await fetch('/api/meal-plans', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch meal plans');
      return response.json();
    },
    enabled: isOpen,
  });

  // Get the most recent meal plan (or create structure for new one)
  const currentPlan = mealPlans?.[0];
  const mealPlanData = currentPlan?.meal_plan || {};
  
  // Extract days from meal plan
  const extractDays = () => {
    const days = [];
    for (let i = 1; i <= 7; i++) {
      const dayKey = `day_${i}`;
      if (mealPlanData[dayKey]) {
        days.push({
          dayNumber: i,
          dayKey,
          meals: mealPlanData[dayKey]
        });
      }
    }
    return days;
  };

  const existingDays = extractDays();
  const nextDayNumber = existingDays.length + 1;

  // Mutation to add recipe to meal plan
  const addToMealPlanMutation = useMutation({
    mutationFn: async ({ dayNumber, mealType }: { dayNumber: number; mealType: string }) => {
      // Prepare the updated meal plan
      const dayKey = `day_${dayNumber}`;
      const updatedMealPlan = { ...mealPlanData };
      
      // Initialize the day if it doesn't exist
      if (!updatedMealPlan[dayKey]) {
        updatedMealPlan[dayKey] = {};
      }
      
      // Add the recipe to the specified meal type
      updatedMealPlan[dayKey][mealType] = {
        ...recipe,
        name: recipe?.title,
        prep_time: recipe?.time_minutes,
        difficulty: 'Medium',
        cuisine: recipe?.cuisine || '',
        diet: recipe?.diet || '',
        ingredients: recipe?.ingredients || [],
        instructions: recipe?.instructions || [],
        nutrition: recipe?.nutrition_info || null,
        image_url: recipe?.image_url || null,
        video_id: recipe?.video_id || null,
        video_title: recipe?.video_title || null,
        video_channel: recipe?.video_channel || null
      };

      // If updating existing meal plan
      if (currentPlan?.id) {
        const response = await fetch(`/api/meal-plan/${currentPlan.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify({
            meal_plan: updatedMealPlan
          }),
        });
        if (!response.ok) throw new Error('Failed to update meal plan');
        return response.json();
      } else {
        // Create new meal plan
        const response = await fetch('/api/save-meal-plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify({
            name: `My Meal Plan - ${new Date().toLocaleDateString()}`,
            description: 'Created from favorites',
            meal_plan: updatedMealPlan,
            date_range: `Day 1 - Day ${dayNumber}`,
            total_recipes: dayNumber * 3,
            preferences: {
              dietary_restrictions: [],
              cuisine_types: [],
              goals: []
            }
          }),
        });
        if (!response.ok) throw new Error('Failed to create meal plan');
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meal-plans'] });
      toast({
        title: "Recipe Added! 🎉",
        description: `${recipe?.title} has been added to your meal plan.`,
        variant: "default",
      });
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add recipe to meal plan. Please try again.",
        variant: "destructive",
      });
      console.error('Error adding to meal plan:', error);
    },
  });

  const handleAddToMealPlan = () => {
    if (selectedSlot) {
      addToMealPlanMutation.mutate({
        dayNumber: selectedSlot.dayNumber,
        mealType: selectedSlot.mealType,
      });
    } else if (isAddingNewDay) {
      addToMealPlanMutation.mutate({
        dayNumber: nextDayNumber,
        mealType: selectedNewDayMeal,
      });
    }
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return <Coffee className="h-4 w-4" />;
      case 'lunch': return <Sun className="h-4 w-4" />;
      case 'dinner': return <Moon className="h-4 w-4" />;
      default: return <ChefHat className="h-4 w-4" />;
    }
  };

  if (!recipe) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-purple-600" />
            Add to Meal Plan
          </DialogTitle>
          <DialogDescription>
            Choose where to add this recipe in your meal plan
          </DialogDescription>
        </DialogHeader>

        {/* Recipe Preview Card */}
        <Card className="mb-4 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              {recipe.image_url && (
                <img 
                  src={recipe.image_url} 
                  alt={recipe.title}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{recipe.title}</h3>
                {recipe.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                    {recipe.description}
                  </p>
                )}
                <div className="flex gap-2 mt-2">
                  {recipe.time_minutes && (
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {recipe.time_minutes} min
                    </Badge>
                  )}
                  {recipe.cuisine && (
                    <Badge variant="secondary" className="text-xs">
                      {recipe.cuisine}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoadingPlans ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <Tabs defaultValue="existing" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="existing" disabled={existingDays.length === 0}>
                Existing Days ({existingDays.length})
              </TabsTrigger>
              <TabsTrigger value="new" disabled={nextDayNumber > 7}>
                Add New Day
              </TabsTrigger>
            </TabsList>

            <TabsContent value="existing" className="space-y-4 mt-4">
              {existingDays.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CalendarDays className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No meal plan days yet. Start by adding a new day!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {existingDays.map((day) => (
                    <Card key={day.dayNumber} className="overflow-hidden">
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-3 text-purple-700">
                          Day {day.dayNumber}
                        </h4>
                        <RadioGroup 
                          value={selectedSlot?.dayNumber === day.dayNumber ? `${day.dayNumber}-${selectedSlot.mealType}` : ""}
                          onValueChange={(value) => {
                            const [, mealType] = value.split('-');
                            setSelectedSlot({
                              dayNumber: day.dayNumber,
                              mealType: mealType as 'breakfast' | 'lunch' | 'dinner',
                              isOccupied: !!day.meals[mealType],
                              currentRecipe: day.meals[mealType]
                            });
                            setIsAddingNewDay(false);
                          }}
                        >
                          <div className="grid grid-cols-3 gap-3">
                            {['breakfast', 'lunch', 'dinner'].map((mealType) => {
                              const meal = day.meals[mealType];
                              const isOccupied = !!meal;
                              const isSelected = selectedSlot?.dayNumber === day.dayNumber && 
                                               selectedSlot?.mealType === mealType;

                              return (
                                <label
                                  key={mealType}
                                  htmlFor={`${day.dayNumber}-${mealType}`}
                                  className={`
                                    relative flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer
                                    transition-all duration-200
                                    ${isSelected 
                                      ? 'border-purple-500 bg-purple-50' 
                                      : isOccupied 
                                        ? 'border-gray-200 bg-gray-50 opacity-60' 
                                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                                    }
                                  `}
                                >
                                  <RadioGroupItem 
                                    value={`${day.dayNumber}-${mealType}`} 
                                    id={`${day.dayNumber}-${mealType}`}
                                    className="sr-only"
                                  />
                                  <div className="flex items-center gap-2 mb-2">
                                    {getMealIcon(mealType)}
                                    <span className="text-sm font-medium capitalize">
                                      {mealType}
                                    </span>
                                  </div>
                                  {isOccupied ? (
                                    <span className="text-xs text-center text-gray-600 line-clamp-2">
                                      {meal.name || meal.title}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-green-600 font-medium">
                                      Empty Slot
                                    </span>
                                  )}
                                  {isSelected && (
                                    <Check className="absolute top-2 right-2 h-4 w-4 text-purple-600" />
                                  )}
                                </label>
                              );
                            })}
                          </div>
                        </RadioGroup>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="new" className="mt-4">
              {nextDayNumber > 7 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>You've reached the maximum of 7 days in your meal plan.</p>
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-purple-700">
                          Create Day {nextDayNumber}
                        </h4>
                        <Badge variant="outline" className="text-purple-600">
                          New Day
                        </Badge>
                      </div>
                      
                      <RadioGroup 
                        value={selectedNewDayMeal} 
                        onValueChange={(value) => {
                          setSelectedNewDayMeal(value as 'breakfast' | 'lunch' | 'dinner');
                          setIsAddingNewDay(true);
                          setSelectedSlot(null);
                        }}
                      >
                        <div className="grid grid-cols-3 gap-4">
                          {['breakfast', 'lunch', 'dinner'].map((mealType) => (
                            <label
                              key={mealType}
                              htmlFor={`new-${mealType}`}
                              className={`
                                flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer
                                transition-all duration-200
                                ${selectedNewDayMeal === mealType && isAddingNewDay
                                  ? 'border-purple-500 bg-purple-50' 
                                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                                }
                              `}
                            >
                              <RadioGroupItem 
                                value={mealType} 
                                id={`new-${mealType}`}
                                className="sr-only"
                              />
                              {getMealIcon(mealType)}
                              <span className="text-sm font-medium capitalize mt-2">
                                {mealType}
                              </span>
                              {selectedNewDayMeal === mealType && isAddingNewDay && (
                                <Check className="h-4 w-4 text-purple-600 mt-2" />
                              )}
                            </label>
                          ))}
                        </div>
                      </RadioGroup>

                      <div className="pt-4 border-t">
                        <p className="text-sm text-gray-600">
                          This will create Day {nextDayNumber} in your meal plan and add "{recipe.title}" 
                          to the {selectedNewDayMeal} slot.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddToMealPlan}
            disabled={!selectedSlot && !isAddingNewDay || addToMealPlanMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {addToMealPlanMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add to Meal Plan
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}