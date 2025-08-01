import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChefHat, Clock, Utensils, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface StreamingMeal {
  day: number;
  mealType: string;
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

export function StreamingMealPlanGenerator({ 
  filters, 
  onComplete, 
  onCancel 
}: StreamingMealPlanGeneratorProps) {
  const [meals, setMeals] = useState<Map<string, StreamingMeal>>(new Map());
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState('Initializing...');
  const eventSourceRef = useRef<EventSource | null>(null);
  const bufferRef = useRef<string>('');
  const { toast } = useToast();

  // Calculate total expected meals
  const totalMeals = filters.numDays * filters.mealsPerDay;

  // Extract complete meal from JSON buffer
  const extractMealsFromBuffer = useCallback((buffer: string): StreamingMeal[] => {
    const extractedMeals: StreamingMeal[] = [];
    
    // More robust meal extraction
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    
    // Try to find each meal type in the buffer
    for (let day = 1; day <= 7; day++) {
      for (const mealType of mealTypes) {
        try {
          // Look for the specific day and meal pattern
          const dayPattern = `"day_${day}"`;
          const dayIndex = buffer.indexOf(dayPattern);
          if (dayIndex === -1) continue;
          
          // Find the next day to limit our search
          const nextDayPattern = `"day_${day + 1}"`;
          const nextDayIndex = buffer.indexOf(nextDayPattern, dayIndex);
          const searchEnd = nextDayIndex > 0 ? nextDayIndex : buffer.length;
          
          // Search for the meal within this day's section
          const daySection = buffer.substring(dayIndex, searchEnd);
          const mealPattern = `"${mealType}"\\s*:\\s*\\{`;
          const mealMatch = daySection.match(new RegExp(mealPattern));
          
          if (!mealMatch || mealMatch.index === undefined) continue;
          
          // Find the start of the meal object
          const mealStartInDay = mealMatch.index + mealMatch[0].length - 1;
          const mealStartInBuffer = dayIndex + mealStartInDay;
          
          // Extract the complete meal object using brace counting
          let braceCount = 0;
          let inString = false;
          let escapeNext = false;
          let mealEndIndex = -1;
          
          for (let i = mealStartInBuffer; i < buffer.length && i < searchEnd; i++) {
            const char = buffer[i];
            
            if (escapeNext) {
              escapeNext = false;
              continue;
            }
            
            if (char === '\\') {
              escapeNext = true;
              continue;
            }
            
            if (char === '"' && !escapeNext) {
              inString = !inString;
              continue;
            }
            
            if (!inString) {
              if (char === '{') braceCount++;
              if (char === '}') {
                braceCount--;
                if (braceCount === 0) {
                  mealEndIndex = i + 1;
                  break;
                }
              }
            }
          }
          
          if (mealEndIndex > 0 && mealEndIndex > mealStartInBuffer) {
            const mealJson = buffer.substring(mealStartInBuffer, mealEndIndex);
            
            try {
              const mealData = JSON.parse(mealJson);
              
              // Validate required fields - be flexible with nutrition field name
              if (mealData.title && 
                  mealData.ingredients && 
                  Array.isArray(mealData.instructions) && 
                  (mealData.nutrition || mealData.nutrition_info) &&
                  typeof mealData.cook_time_minutes === 'number' &&
                  typeof mealData.difficulty === 'number') {
                
                // Normalize nutrition field
                const nutrition = mealData.nutrition || mealData.nutrition_info;
                
                extractedMeals.push({
                  day,
                  mealType,
                  title: mealData.title,
                  cook_time_minutes: mealData.cook_time_minutes,
                  difficulty: mealData.difficulty,
                  ingredients: mealData.ingredients,
                  instructions: mealData.instructions,
                  nutrition: nutrition
                });
              }
            } catch (e) {
              // JSON parsing failed - this is expected for incomplete data
            }
          }
        } catch (e) {
          // Continue to next meal
        }
      }
    }
    
    return extractedMeals;
  }, []);

  // Start streaming generation
  const startGeneration = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    setMeals(new Map());
    setProgress(0);
    setCurrentStatus('Connecting to AI...');
    bufferRef.current = '';

    try {
      // Get auth token (try both possible keys)
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      
      // Create request body
      const requestBody = {
        ...filters,
        useIntelligentPrompt: filters.useIntelligentPrompt ?? true
      };

      // Use fetch with ReadableStream for better control
      const response = await fetch('/api/meal-plan/generate-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Failed to initialize stream reader');
      }

      setCurrentStatus('Generating meal plan...');
      
      console.log('Starting to read stream...');
      let lineBuffer = '';

      // Read stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('Stream reading complete');
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        lineBuffer += chunk;
        
        // Process complete lines
        const lines = lineBuffer.split('\n');
        lineBuffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine === '') continue;
          
          if (trimmedLine.startsWith('data: ')) {
            const data = trimmedLine.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              
              // Handle debug prompt message
              if (parsed.type === 'debug_prompt') {
                console.log('🎯 COMPLETE PROMPT BEING SENT TO AI:');
                console.log('=====================================');
                console.log(parsed.prompt);
                console.log('=====================================');
                console.log(`📏 Prompt length: ${parsed.promptLength} characters`);
                continue;
              }
              
              // Handle token refresh message
              if (parsed.type === 'token_refresh') {
                console.log('🔄 Received new authentication token');
                localStorage.setItem('auth_token', parsed.token);
                
                // Notify the app about token refresh
                window.dispatchEvent(new CustomEvent('auth-token-refreshed', { 
                  detail: { token: parsed.token, message: parsed.message } 
                }));
                
                toast({
                  title: "Authentication Updated",
                  description: parsed.message,
                });
                continue;
              }
              
              if (parsed.type === 'chunk') {
                // Update buffer
                bufferRef.current = parsed.buffer;
                
                // Debug logging
                if (parsed.chunkIndex % 10 === 0) {
                  console.log(`Received chunk ${parsed.chunkIndex}, buffer length: ${bufferRef.current.length}`);
                }
                
                // Try to extract complete meals
                const allMealsInBuffer = extractMealsFromBuffer(bufferRef.current);
                
                // Update meals state with new meals only
                setMeals(prevMeals => {
                  const updatedMeals = new Map(prevMeals);
                  let newMealsCount = 0;
                  
                  for (const meal of allMealsInBuffer) {
                    const mealKey = `day_${meal.day}_${meal.mealType}`;
                    if (!updatedMeals.has(mealKey)) {
                      updatedMeals.set(mealKey, meal);
                      newMealsCount++;
                      
                      // Log new meal
                      console.log(`✅ New meal added: Day ${meal.day} ${meal.mealType} - ${meal.title}`);
                      
                      // Update status
                      setCurrentStatus(`Generated ${meal.mealType} for Day ${meal.day}`);
                    }
                  }
                  
                  if (newMealsCount > 0) {
                    console.log(`Added ${newMealsCount} new meals. Total: ${updatedMeals.size}/${totalMeals}`);
                  }
                  
                  // Update progress
                  const progressPercent = (updatedMeals.size / totalMeals) * 100;
                  setProgress(progressPercent);
                  
                  return updatedMeals;
                });
                
              } else if (parsed.type === 'complete') {
                // Generation complete
                console.log('Stream complete, received meal plan:', parsed.mealPlan);
                setCurrentStatus('Finalizing meal plan...');
                setProgress(100);
                
                // Convert meal plan to expected format
                const mealPlan = parsed.mealPlan;
                
                // Call completion handler
                onComplete(mealPlan);
                
                toast({
                  title: "Meal plan generated!",
                  description: `Successfully generated ${totalMeals} meals.`
                });
                
              } else if (parsed.type === 'error') {
                console.error('Stream error:', parsed);
                throw new Error(parsed.message || 'Generation failed');
              }
              
            } catch (e) {
              console.error('Error parsing stream data:', e);
            }
          }
        }
      }

    } catch (err: any) {
      console.error('Streaming error:', err);
      setError(err.message || 'Failed to generate meal plan');
      toast({
        title: "Generation failed",
        description: err.message || 'Failed to generate meal plan',
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  }, [filters, extractMealsFromBuffer, totalMeals, onComplete, toast]);

  // Group meals by day
  const mealsByDay = React.useMemo(() => {
    const grouped = new Map<number, StreamingMeal[]>();
    
    for (const [_, meal] of meals) {
      const dayMeals = grouped.get(meal.day) || [];
      dayMeals.push(meal);
      grouped.set(meal.day, dayMeals);
    }
    
    return grouped;
  }, [meals]);

  React.useEffect(() => {
    startGeneration();
    
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [startGeneration]);

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 animate-pulse" />
              Generating Your Meal Plan
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={!isGenerating}
            >
              Cancel
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{currentStatus}</span>
              <span>{meals.size} of {totalMeals} meals</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
          
          {error && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Streaming Meals Display */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {Array.from(mealsByDay).sort(([a], [b]) => a - b).map(([day, dayMeals]) => (
            <motion.div
              key={`day-${day}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Day {day}
                    <Badge variant="secondary" className="ml-2">
                      {dayMeals.length} meals
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dayMeals.sort((a, b) => {
                      const order = ['breakfast', 'lunch', 'dinner', 'snack'];
                      return order.indexOf(a.mealType) - order.indexOf(b.mealType);
                    }).map((meal) => (
                      <motion.div
                        key={`${meal.day}-${meal.mealType}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-lg">{meal.title}</h4>
                          <Badge variant="outline" className="capitalize">
                            {meal.mealType}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {meal.cook_time_minutes} min
                          </div>
                          <div className="flex items-center gap-1">
                            <Utensils className="h-4 w-4" />
                            Difficulty: {meal.difficulty}/5
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-sm mb-1">Ingredients:</h5>
                          <ul className="list-disc list-inside text-sm text-muted-foreground">
                            {meal.ingredients.map((ing, idx) => (
                              <li key={idx}>{ing}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-sm mb-1">Instructions:</h5>
                          <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                            {meal.instructions.map((inst, idx) => (
                              <li key={idx}>{inst}</li>
                            ))}
                          </ol>
                        </div>
                        
                        <div className="flex gap-4 text-sm">
                          <Badge variant="secondary">
                            Calories: {meal.nutrition.calories}
                          </Badge>
                          <Badge variant="secondary">
                            Protein: {meal.nutrition.protein_g}g
                          </Badge>
                          <Badge variant="secondary">
                            Carbs: {meal.nutrition.carbs_g}g
                          </Badge>
                          <Badge variant="secondary">
                            Fat: {meal.nutrition.fat_g}g
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}