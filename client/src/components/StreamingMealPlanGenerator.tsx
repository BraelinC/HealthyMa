import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChefHat, Clock, Utensils, AlertCircle, Coffee, Sun, Moon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest } from '@/lib/queryClient';

interface StreamingMealPlanGeneratorProps {
  filters: {
    numDays: number;
    mealsPerDay: number;
    cookTime: number;
    difficulty: number;
    nutritionGoal?: string;
    dietaryRestrictions?: string;
    availableIngredients?: string;
    excludeIngredients?: string;
    primaryGoal?: string;
    culturalBackground?: string[];
    selectedFamilyMembers?: string[];
    useIntelligentPrompt?: boolean;
  };
  onComplete: (mealPlan: any) => void;
  onCancel: () => void;
}

interface Meal {
  title?: string;
  name?: string;
  description?: string;
  prep_time: number;
  cook_time: number;
  cook_time_minutes?: number;
  difficulty: number;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  day: number;
  totalTime: number;
  id?: string;
}

export function StreamingMealPlanGenerator({ 
  filters, 
  onComplete, 
  onCancel 
}: StreamingMealPlanGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState('Initializing...');
  const [progress, setProgress] = useState(0);
  const [liveParsingMeals, setLiveParsingMeals] = useState<Meal[]>([]);
  const { toast } = useToast();

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return Coffee;
      case 'lunch':
        return Sun;
      case 'dinner':
        return Moon;
      default:
        return Utensils;
    }
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 3) return 'Easy';
    if (difficulty <= 6) return 'Medium';
    return 'Hard';
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) return 'bg-green-100 text-green-800';
    if (difficulty <= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const startGeneration = useCallback(async () => {
    try {
      setIsGenerating(true);
      setError(null);
      setLiveParsingMeals([]); // Reset meals

      // Get token from storage
      const token = localStorage.getItem('auth_token');
      console.log('Token available:', !!token);

      const requestBody = {
        ...filters,
        useIntelligentPrompt: filters.useIntelligentPrompt ?? true
      };

      // Check for weight-based planning profile
      const isWeightBasedPlanning = filters.primaryGoal === 'Weight-Based Planning' || 
                                   filters.primaryGoal === 'weight-based' ||
                                   filters.primaryGoal === 'Weight-based Planning';
                                   
      if (isWeightBasedPlanning) {
        console.log('🎯 Detected weight-based planning, switching to enhanced meal plan generation');
        const endpoint = '/api/enhanced-meal-plan';
        
        // Get user's actual weight preferences from their profile
        let goalWeights = {
          cost: 0.5,
          health: 0.5,
          cultural: 0.5,
          variety: 0.5,
          time: 0.5
        };
        
        try {
          const profileData = await apiRequest('/api/profiles/me');
          if (profileData?.goalWeights) {
            goalWeights = profileData.goalWeights;
            console.log('✅ Using saved weight preferences:', goalWeights);
          }
        } catch (error) {
          console.warn('Failed to fetch weight preferences, using defaults:', error);
        }
        
        // For weight-based planning, we need to use enhanced meal plan generator
        const data = await apiRequest(endpoint, {
          method: 'POST',
          body: JSON.stringify({
            numDays: filters.numDays,
            mealsPerDay: filters.mealsPerDay,
            goalWeights: goalWeights
          })
        });
        console.log('✅ Weight-based meal plan generated:', data);
        
        // Convert the enhanced meal plan format to the expected format
        onComplete(data);
        return;
      }

      // Use streaming endpoint for regular meal plan generation
      const response = await fetch('/api/meal-plan/generate-stream', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        // Try to parse error response
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        } catch {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      // Process Server-Sent Events stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.type === 'meal') {
                // Add new meal to the display array
                setLiveParsingMeals(prev => [...prev, parsed.data]);
              } else if (parsed.type === 'complete') {
                // Meal plan generation complete
                onComplete(parsed.data);
                return;
              } else if (parsed.type === 'done') {
                // Generation finished but couldn't parse complete plan
                // Use the meals we collected
                if (liveParsingMeals.length > 0) {
                  // Construct a meal plan from collected meals
                  const mealPlan: any = {};
                  liveParsingMeals.forEach(meal => {
                    const dayKey = `day_${meal.day}`;
                    if (!mealPlan[dayKey]) {
                      mealPlan[dayKey] = { breakfast: null, lunch: null, dinner: null };
                    }
                    mealPlan[dayKey][meal.mealType] = meal;
                  });
                  onComplete(mealPlan);
                }
                return;
              } else if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (e) {
              // Not JSON or parsing error - ignore
              console.log('Streaming data:', data);
            }
          }
        }
      }

    } catch (error) {
      console.error('Generation error:', error);
      
      // Fallback to regular generation endpoint on streaming failure
      try {
        console.log('Streaming failed, falling back to regular generation');
        setCurrentStatus('Retrying with standard generation...');
        
        const fallbackResponse = await fetch('/api/meal-plan/generate', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('auth_token') && { 
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}` 
            })
          },
          body: JSON.stringify({
            ...filters,
            useIntelligentPrompt: filters.useIntelligentPrompt ?? true
          })
        });
        
        if (!fallbackResponse.ok) {
          const errorData = await fallbackResponse.json();
          throw new Error(errorData.message || 'Failed to generate meal plan');
        }
        
        const data = await fallbackResponse.json();
        setProgress(100);
        setCurrentStatus('Meal plan generated successfully!');
        onComplete(data);
        
      } catch (fallbackError) {
        setError(fallbackError instanceof Error ? fallbackError.message : 'Failed to generate meal plan');
        toast({
          title: "Generation Failed",
          description: fallbackError instanceof Error ? fallbackError.message : 'Please try again',
          variant: "destructive",
        });
      }
    } finally {
      setIsGenerating(false);
    }
  }, [filters, onComplete, toast]);

  // Start generation immediately when component mounts
  React.useEffect(() => {
    startGeneration();
  }, []);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {isGenerating && liveParsingMeals.length === 0 && (
          <p className="text-sm text-muted-foreground text-center">
            Crafting delicious meals just for you...
          </p>
        )}
      </div>
      <div className="space-y-4">
        {/* Meal cards grid */}
        <AnimatePresence mode="popLayout">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {liveParsingMeals.map((meal, index) => {
                  const Icon = getMealIcon(meal.mealType);
                  return (
                    <motion.div
                      key={meal.id || `${meal.day}-${meal.mealType}-${meal.title || meal.name}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.4,
                        delay: index * 0.1,
                        ease: "easeOut"
                      }}
                      className="animate-in slide-in-from-bottom"
                    >
                      <Card className="h-full hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className="h-5 w-5 text-primary" />
                              <Badge variant="secondary" className="text-xs">
                                Day {meal.day} - {meal.mealType}
                              </Badge>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getDifficultyColor(meal.difficulty)}`}
                            >
                              {getDifficultyLabel(meal.difficulty)}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-lg mt-2 line-clamp-2">
                            {meal.title || meal.name}
                          </h3>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {meal.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {meal.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{meal.totalTime || (meal.prep_time + (meal.cook_time || meal.cook_time_minutes || 0))} min</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Prep: {meal.prep_time}min • Cook: {meal.cook_time || meal.cook_time_minutes || 0}min
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>

            {/* Loading indicator when no meals yet */}
            {isGenerating && liveParsingMeals.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="text-muted-foreground">Generating your meal plan...</span>
                </div>
              </div>
            )}

            {/* Error display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-destructive/10 text-destructive rounded-lg p-4 flex items-start gap-2"
              >
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Generation Failed</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Action buttons */}
            {(isGenerating || error) && (
              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={!isGenerating}
                >
                  Cancel
                </Button>
                {error && (
                  <Button onClick={startGeneration}>
                    Retry Generation
                  </Button>
                )}
              </div>
            )}
      </div>
    </div>
  );
}