import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  nutrition?: {
    calories?: number;
    protein_g?: number;
    carbs_g?: number;
    fat_g?: number;
  };
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
  const [renderKey, setRenderKey] = useState(0); // Force re-render key  
  const [debugMealCount, setDebugMealCount] = useState(0); // Separate debug state
  const { toast } = useToast();
  
  // Force update function
  const forceUpdate = useCallback(() => {
    setRenderKey(prev => prev + 1);
  }, []);

  // Track meal state changes for render updates
  useEffect(() => {
    setDebugMealCount(liveParsingMeals.length);
  }, [liveParsingMeals]);

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return '🍳';
      case 'lunch':
        return '🥗';
      case 'dinner':
        return '🍽️';
      default:
        return '🍴';
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
      console.log('🚀 Making streaming request to:', '/api/meal-plan/generate-stream');
      console.log('📝 Request body:', JSON.stringify(requestBody, null, 2));
      console.log('🔑 Auth token present:', !!token);
      
      const response = await fetch('/api/meal-plan/generate-stream', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      console.log('📡 Response ok:', response.ok);
      console.log('📡 Response body:', !!response.body);
      console.log('📡 Response content-type:', response.headers.get('content-type'));

      if (!response.ok) {
        console.error('❌ Response not OK:', response.status, response.statusText);
        // Try to parse error response
        try {
          const errorData = await response.json();
          console.error('❌ Error data:', errorData);
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        } catch {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      // Process Server-Sent Events stream
      console.log('🔍 Attempting to get response body reader...');
      const reader = response.body?.getReader();
      console.log('🔍 Reader obtained:', !!reader);
      
      const decoder = new TextDecoder();
      let buffer = '';

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      console.log('🎥 Starting to read SSE stream...');
      console.log('📊 Initial liveParsingMeals length:', liveParsingMeals.length);

      let chunkCount = 0;
      while (true) {
        chunkCount++;
        const { done, value } = await reader.read();
        if (done) {
          console.log('🏁 SSE stream ended after', chunkCount, 'chunks');
          break;
        }
        
        console.log(`📦 Chunk ${chunkCount}:`, value ? `${value.length} bytes` : 'empty');

        const decodedText = decoder.decode(value, { stream: true });
        console.log('🔤 Decoded text:', decodedText.substring(0, 100) + (decodedText.length > 100 ? '...' : ''));
        
        buffer += decodedText;
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        console.log(`📋 Processing ${lines.length} lines from buffer`);

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            console.log('📡 Received SSE data:', data.substring(0, 100) + '...');
            
            try {
              const parsed = JSON.parse(data);
              console.log('✅ Parsed SSE data:', parsed.type, parsed.data?.title || parsed.data);
              
              if (parsed.type === 'meal') {
                console.log(`🍽️ Adding meal to UI: ${parsed.data.title} (${parsed.data.mealType})`);
                
                // Set generating to false as soon as first meal arrives to show meal cards
                setIsGenerating(false);
                
                // Add new meal to the display array immediately  
                setLiveParsingMeals(prev => {
                  // Check if meal already exists to prevent duplicates
                  const mealId = parsed.data.id || `${parsed.data.day || 1}-${parsed.data.mealType}-${parsed.data.title || parsed.data.name}`;
                  if (prev.find(m => (m.id || `${m.day || 1}-${m.mealType}-${m.title || m.name}`) === mealId)) {
                    console.log('⏭️ Skipping duplicate meal:', parsed.data.title);
                    return prev; // Already added
                  }
                  
                  // Add the meal with proper structure
                  const newMeal = {
                    ...parsed.data,
                    id: mealId,
                    day: parsed.data.day || 1,
                    prep_time: parsed.data.prep_time || 5,
                    cook_time: parsed.data.cook_time || parsed.data.cook_time_minutes || 15,
                    totalTime: (parsed.data.prep_time || 5) + (parsed.data.cook_time || parsed.data.cook_time_minutes || 15)
                  };
                  
                  const newMeals = [...prev, newMeal];
                  console.log(`📊 Total meals now: ${newMeals.length}`);
                  console.log('🎯 Updated meal list:', newMeals.map(m => m.title || m.name));
                  
                  // FORCE RE-RENDER after state update
                  setTimeout(() => {
                    forceUpdate();
                    setDebugMealCount(newMeals.length);
                  }, 0);
                  
                  return newMeals;
                });
              } else if (parsed.type === 'complete') {
                console.log('✅ Complete meal plan received');
                // Meal plan generation complete - defer to prevent render cycle issues
                setTimeout(() => onComplete(parsed.data), 0);
                return;
              } else if (parsed.type === 'done') {
                console.log('🏁 Generation done, using collected meals');
                // Generation finished but couldn't parse complete plan
                // Use the meals we collected
                setLiveParsingMeals(currentMeals => {
                  if (currentMeals.length > 0) {
                    console.log(`📦 Building meal plan from ${currentMeals.length} collected meals`);
                    // Construct a meal plan from collected meals
                    const mealPlan: any = {};
                    currentMeals.forEach(meal => {
                      const dayKey = `day_${meal.day}`;
                      if (!mealPlan[dayKey]) {
                        mealPlan[dayKey] = { breakfast: null, lunch: null, dinner: null };
                      }
                      mealPlan[dayKey][meal.mealType] = meal;
                    });
                    // Defer onComplete to prevent render cycle issues
                    setTimeout(() => onComplete(mealPlan), 0);
                  }
                  return currentMeals;
                });
                return;
              } else if (parsed.error) {
                console.error('❌ SSE error received:', parsed.error);
                throw new Error(parsed.error);
              }
            } catch (e) {
              // Not JSON or parsing error - ignore
              console.log('🔍 Non-JSON streaming data:', data.substring(0, 50));
            }
          } else if (line.trim()) {
            console.log('📝 SSE line (not data):', line.substring(0, 50));
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

  // Clean production render - debug removed

  // Beautiful streaming meal display
  return (
    <div key={renderKey} className="space-y-4">
      {(() => {
        const hasMeals = liveParsingMeals.length > 0;
        
        if (!hasMeals) {
          return (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 mb-6"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <ChefHat className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  🔥 Generating Your Perfect Meals
                </h3>
                <p className="text-gray-500 text-sm">
                  Our AI chef is creating personalized recipes just for you...
                </p>
              </div>
            </div>
          );
        }
        
        return (
          <div className="space-y-4">
            {/* Progress Header */}
            <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <ChefHat className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-800">
                    ✨ Found {liveParsingMeals.length} Perfect Meals!
                  </h3>
                  <p className="text-sm text-emerald-600">
                    Your personalized meal plan is ready
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
                <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                Live Generated
              </div>
            </div>

            {/* Beautiful Meal Cards */}
            <div className="grid gap-4">
              {liveParsingMeals.map((meal, index) => (
                <div 
                  key={meal.id || index} 
                  className="group relative bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:border-emerald-300 animate-fadeIn"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getMealIcon(meal.mealType)}</span>
                        <div>
                          <div className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                            Day {meal.day} • {meal.mealType}
                          </div>
                          <h4 className="font-semibold text-gray-800 group-hover:text-emerald-700 transition-colors">
                            {meal.title || meal.name}
                          </h4>
                        </div>
                      </div>
                      
                      {/* Meal Details */}
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{meal.cook_time_minutes || meal.cook_time}min</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <span>⭐</span>
                          <span>Difficulty {meal.difficulty}</span>
                        </div>
                        {meal.nutrition && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span>🔥 {meal.nutrition.calories} cal</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Error section if needed */}
      {error && (
        <div className="bg-red-200 border border-red-500 p-3">
          Error: {error}
        </div>
      )}
    </div>
  );
}