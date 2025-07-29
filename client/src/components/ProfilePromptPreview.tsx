import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import { 
  Eye,
  EyeOff,
  ChefHat,
  Users,
  Globe,
  Target,
  Clock,
  ChevronDown,
  ChevronRight,
  Scale,
  DollarSign,
  Activity,
  Star,
  Database,
  Zap,
  Play,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { useCulturalCache, useCulturalCuisineData } from '@/hooks/useCulturalCache';

interface FamilyMember {
  name: string;
  ageGroup: 'Child' | 'Teen' | 'Adult';
  preferences: string[];
  dietaryRestrictions: string[];
  goals: string[];
  role?: string;
}

interface UnifiedGoal {
  value: string;
  label: string;
  nutritionFocus: string;
  prompts: string[];
  filterAdjustments: any;
}

interface GoalWeights {
  cost: number;
  health: number;
  cultural: number;
  variety: number;
  time: number;
}

interface MealRankingTest {
  culture: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  results?: {
    rankedMeals: Array<{
      meal: {
        name: string;
        cuisine: string;
        description: string;
        authenticity_score: number;
        health_score: number;
        cost_score: number;
        time_score: number;
      };
      total_score: number;
      ranking_explanation: string;
    }>;
    reasoning: string;
    processingTime: number;
  };
  error?: string;
}

interface ProfilePromptPreviewProps {
  profile: any;
  familyMembers: FamilyMember[];
}

// Define goals based on profile type
const FAMILY_GOALS: UnifiedGoal[] = [
  {
    value: "Save Money",
    label: "💸 Save Money",
    nutritionFocus: "general_wellness",
    prompts: ["Generate a weekly meal plan using budget-friendly recipes for a family"]
  },
  {
    value: "Quick & Simple Meals",
    label: "⏱️ Quick & Simple",
    nutritionFocus: "general_wellness",
    prompts: ["Create a meal plan with recipes that require minimal ingredients and simple steps"]
  },
  {
    value: "Complex Meals",
    label: "👨‍🍳 Complex Meals",
    nutritionFocus: "general_wellness",
    prompts: ["Suggest gourmet or elaborate recipes for families who enjoy cooking together"]
  },
  {
    value: "Cook Big Batches",
    label: "🍲 Big Batch Cooking",
    nutritionFocus: "general_wellness",
    prompts: ["Plan meals that can be cooked in large quantities for a family"]
  },
  {
    value: "Baby-Friendly",
    label: "👶 Baby-Friendly",
    nutritionFocus: "baby_nutrition",
    prompts: ["Generate meal plans suitable for babies and toddlers (ages 6-24 months)"]
  },
  {
    value: "Young Kid-Friendly",
    label: "🧒 Kid-Friendly",
    nutritionFocus: "general_wellness",
    prompts: ["Provide meal ideas for young children (ages 2-6 years)"]
  }
];

const INDIVIDUAL_GOALS: UnifiedGoal[] = [
  {
    value: "Save Money",
    label: "💸 Save Money",
    nutritionFocus: "general_wellness",
    prompts: ["Generate a weekly meal plan for one person using budget-friendly recipes"]
  },
  {
    value: "Meal Prep",
    label: "🥡 Meal Prep",
    nutritionFocus: "general_wellness",
    prompts: ["Create a meal plan optimized for weekly meal prep for one person"]
  },
  {
    value: "Gain Muscle",
    label: "💪 Gain Muscle",
    nutritionFocus: "muscle_gain",
    prompts: ["Create high-protein meal plans for one person focusing on muscle growth"]
  },
  {
    value: "Lose Weight",
    label: "⚖️ Lose Weight",
    nutritionFocus: "weight_loss",
    prompts: ["Suggest calorie-conscious meals for one person with portion control"]
  },
  {
    value: "Eat Healthier",
    label: "🥗 Eat Healthier",
    nutritionFocus: "general_wellness",
    prompts: ["Plan balanced, nutrient-dense meals for one person"]
  },
  {
    value: "Energy & Performance",
    label: "⚡ Energy & Performance",
    nutritionFocus: "energy_performance",
    prompts: ["Provide meal plans for one active person that boost energy"]
  },
  {
    value: "Digestive Health",
    label: "🥦 Digestive Health",
    nutritionFocus: "digestive_health",
    prompts: ["Suggest meals for one person that are easy to digest"]
  }
];

// Helper function to get unified goal by value
function getUnifiedGoal(goalValue: string, profileType?: 'family' | 'individual'): UnifiedGoal | null {
  const goals = profileType === 'family' ? FAMILY_GOALS : INDIVIDUAL_GOALS;
  return goals.find(goal => goal.value.toLowerCase() === goalValue.toLowerCase()) || null;
}

export default function ProfilePromptPreview({ profile, familyMembers }: ProfilePromptPreviewProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [builtPrompt, setBuiltPrompt] = useState('');
  const [promptSteps, setPromptSteps] = useState<Array<{
    step: string;
    title: string;
    content: string;
    data?: any;
  }>>([]);
  const [showRankingTests, setShowRankingTests] = useState(false);
  const [rankingTests, setRankingTests] = useState<MealRankingTest[]>([]);

  // Get cultural cache data for real-time status
  const { cacheStats } = useCulturalCache();
  const { cacheData: culturalCacheData, loading: culturalLoading } = useCulturalCuisineData(
    profile?.cultural_background || []
  );

  // Create userProfile object for IntelligentMealSelector
  const userProfile = {
    cultural_preferences: profile?.cultural_background?.reduce((acc: any, culture: string) => {
      acc[culture] = 0.9;
      return acc;
    }, {}) || {},
    priority_weights: profile?.goal_weights || {
      cultural: 0.9,
      health: 0.6,
      cost: 0.8,
      time: 0.3,
      variety: 0.4
    },
    dietary_restrictions: familyMembers.flatMap(m => m.dietaryRestrictions || []),
    preferences: familyMembers.flatMap(m => m.preferences || []),
    primary_goal: profile?.primary_goal || 'Save Money',
    family_size: familyMembers.length > 0 ? familyMembers.length : profile?.family_size || 1
  };

  // Build prompt from profile data
  const buildPromptFromProfile = () => {
    const steps: Array<{step: string, title: string, content: string, data?: any}> = [];
    let prompt = '';

    // Get serving size (simple count from family members or default to 1)
    const servingSize = familyMembers.length > 0 ? familyMembers.length : profile?.family_size || 1;

    // Default meal plan settings (would come from user's actual preferences in real implementation)
    const defaultSettings = {
      numDays: 3,
      mealsPerDay: 3,
      servingSize: servingSize
    };

    // Step 1: Base prompt with serving context
    const basePrompt = `Create exactly a ${defaultSettings.numDays}-day meal plan with ${defaultSettings.mealsPerDay} meals per day for ${defaultSettings.servingSize} serving${defaultSettings.servingSize > 1 ? 's' : ''}`;
    prompt = basePrompt;
    steps.push({
      step: '1️⃣',
      title: 'Base Meal Plan Structure',
      content: basePrompt,
      data: { 
        days: defaultSettings.numDays, 
        meals: defaultSettings.mealsPerDay,
        servings: defaultSettings.servingSize
      }
    });

    // Step 2: Goal-Optimized Requirements (using UNIFIED_GOALS system)
    if (profile?.primary_goal) {
      const unifiedGoal = getUnifiedGoal(profile.primary_goal, profile?.profile_type);
      
      if (unifiedGoal) {
        // Use the actual goal-specific prompts from UNIFIED_GOALS
        const goalPrompts = unifiedGoal.prompts.slice(0, 3); // Show first 3 prompts
        const goalContext = `\n\n${goalPrompts.join('\n')}`;
        prompt += goalContext;
        
        steps.push({
          step: '🎯',
          title: `Goal-Optimized: ${unifiedGoal.label}`,
          content: goalPrompts.join(' • '),
          data: { 
            goal: profile.primary_goal,
            nutritionFocus: unifiedGoal.nutritionFocus,
            filterAdjustments: unifiedGoal.filterAdjustments,
            allPrompts: unifiedGoal.prompts
          }
        });
      } else {
        // Fallback for unknown goals
        const goalContext = `\n\nPRIMARY GOAL: ${profile.primary_goal}`;
        prompt += goalContext;
        steps.push({
          step: '🎯',
          title: 'Your Primary Goal',
          content: profile.primary_goal,
          data: { goal: profile.primary_goal }
        });
      }
    }

    // Step 3: Weight-Based Priorities (enhanced visualization)
    if (profile?.primary_goal === 'Weight-Based Planning') {
      // Use profile goal_weights if available, otherwise create mock data for demonstration
      const weights = profile?.goal_weights || {
        cost: 0.8,      // High cost priority (save money focus)
        health: 0.6,    // Moderate health priority  
        cultural: 0.9,  // High cultural priority (authentic dishes)
        variety: 0.4,   // Lower variety (consistent ingredients)
        time: 0.3       // Lower time priority (willing to cook longer)
      };
      
      const weightText = `\n\nPRIORITY WEIGHTS (0-1 scale):\n- Cost efficiency: ${weights.cost.toFixed(1)} (${weights.cost > 0.7 ? 'ingredient overlap prioritized' : 'variety over savings'})\n- Health focus: ${weights.health.toFixed(1)} (${weights.health > 0.7 ? 'nutrition-first choices' : 'balanced approach'})\n- Cultural authenticity: ${weights.cultural.toFixed(1)} (${weights.cultural > 0.7 ? 'traditional recipes favored' : 'modern adaptations ok'})\n- Meal variety: ${weights.variety.toFixed(1)} (${weights.variety > 0.7 ? 'diverse cuisines' : 'consistent base ingredients'})\n- Time efficiency: ${weights.time.toFixed(1)} (${weights.time > 0.7 ? 'quick meals prioritized' : 'complex cooking acceptable'})`;
      prompt += weightText;
      
      // Identify dominant priorities
      const sortedWeights = Object.entries(weights)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 2);
      
      const dominantPriorities = sortedWeights.map(([key, value]) => 
        `${key}: ${((value as number) * 100).toFixed(0)}%`
      ).join(', ');
      
      steps.push({
        step: '⚖️',
        title: 'Weight-Based Priority System',
        content: `Dominant priorities → ${dominantPriorities}. Conflicts resolved using these weights.`,
        data: { 
          weights: weights,
          dominantPriorities: sortedWeights,
          conflictResolution: 'Higher weights win in recipe selection conflicts',
          note: profile?.goal_weights ? 'From your profile settings' : 'Demo weights (configure in Weight-Based Profile)'
        }
      });
      
      // Add intelligent conflict resolution explanation
      const conflictExamples = [];
      if (weights.cost > weights.variety) {
        conflictExamples.push("Ingredient overlap preferred over meal diversity");
      }
      if (weights.cultural > weights.health) {
        conflictExamples.push("Authentic recipes chosen over health adaptations");  
      }
      if (weights.time < weights.cultural) {
        conflictExamples.push("Traditional cooking methods used despite longer prep time");
      }
      
      if (conflictExamples.length > 0) {
        const conflictText = `\n- Smart conflict resolution: ${conflictExamples.join('; ')}`;
        prompt += conflictText;
        
        steps.push({
          step: '🧠',
          title: 'Intelligent Conflict Resolution',
          content: conflictExamples.join(' • '),
          data: { 
            examples: conflictExamples,
            reasoning: 'Weight-based system automatically resolves competing meal objectives'
          }
        });
      }
    }

    // Step 4: Dietary Preferences (streamlined - no family structure details)
    if (familyMembers.length > 0) {
      const allPreferences = familyMembers.flatMap(m => m.preferences || []);
      const uniquePreferences = Array.from(new Set(allPreferences));
      
      if (uniquePreferences.length > 0) {
        const preferencesText = `\n- Dietary preferences (combined): ${uniquePreferences.join(', ')}`;
        prompt += preferencesText;
        
        steps.push({
          step: '👥',
          title: 'Combined Dietary Preferences',
          content: uniquePreferences.join(', '),
          data: { 
            preferences: uniquePreferences,
            source: `From ${familyMembers.length} family member${familyMembers.length > 1 ? 's' : ''}`
          }
        });
      }

      // Child-friendly requirements (simplified)
      const children = familyMembers.filter(m => m.ageGroup === 'Child');
      if (children.length > 0) {
        const childFriendly = `\n- Include child-friendly options that appeal to kids`;
        prompt += childFriendly;
        
        steps.push({
          step: '👶',
          title: 'Child-Friendly Considerations',
          content: `Kid-friendly options included for ${children.length} child${children.length > 1 ? 'ren' : ''}`,
          data: { children: children.map(c => c.name) }
        });
      }
    }

    // Step 6: Dietary restrictions (100% compliance)
    const allRestrictions = new Set<string>();
    
    // Add from family members
    familyMembers.forEach(member => {
      if (member.dietaryRestrictions) {
        member.dietaryRestrictions.forEach(r => allRestrictions.add(r));
      }
    });
    
    // Add from profile preferences (backward compatibility)
    if (profile?.preferences) {
      profile.preferences.forEach((pref: string) => {
        const lowerPref = pref.toLowerCase().trim();
        if (lowerPref.includes('allerg') || lowerPref.includes('intoleran') || 
            lowerPref.includes('free') || lowerPref.includes('vegan') || 
            lowerPref.includes('vegetarian') || lowerPref.includes('kosher') ||
            lowerPref.includes('halal') || lowerPref.includes('diet')) {
          allRestrictions.add(pref);
        }
      });
    }
    
    if (allRestrictions.size > 0) {
      const restrictionsText = `\n- DIETARY RESTRICTIONS (100% COMPLIANCE): ${Array.from(allRestrictions).join(', ')}`;
      prompt += restrictionsText;
      
      const memberRestrictions = familyMembers
        .filter(m => m.dietaryRestrictions && m.dietaryRestrictions.length > 0)
        .map(m => ({ name: m.name, restrictions: m.dietaryRestrictions }));
      
      steps.push({
        step: '🚫',
        title: 'Dietary Restrictions (Mandatory Compliance)',
        content: Array.from(allRestrictions).join(', '),
        data: { 
          restrictions: Array.from(allRestrictions),
          memberBreakdown: memberRestrictions
        }
      });
    }

    // Step 5: Cultural Intelligence Integration (with real cache data)
    if (profile?.cultural_background && profile.cultural_background.length > 0) {
      const culturalText = `\n\n🌍 CULTURAL CUISINE INTEGRATION:\n- Include authentic dishes from: ${profile.cultural_background.join(', ')}\n- Prioritize traditional cooking methods and ingredients\n- Balance authenticity with dietary restrictions and preferences`;
      prompt += culturalText;
      
      // Use real cultural cache data if available, fallback to loading state
      if (culturalLoading) {
        steps.push({
          step: '🌍',
          title: 'Cultural Intelligence Loading...',
          content: `Loading cache data for: ${profile.cultural_background.join(', ')}`,
          data: { loading: true }
        });
      } else {
        const cacheStatusDisplay = profile.cultural_background.map((culture: string) => {
          const cacheData = culturalCacheData.find(c => c.culture === culture);
          
          if (cacheData) {
            const cacheIcon = cacheData.cached ? '✅' : '⚡';
            const authScore = cacheData.authenticity_score.toFixed(2);
            const complexity = cacheData.complexity.toFixed(1);
            const accessInfo = cacheData.cached ? ` (${cacheData.meals_count} meals, ${cacheData.access_count} uses)` : ' (fetching fresh data)';
            return `${culture} ${cacheIcon} auth:${authScore} complexity:${complexity}/5${accessInfo}`;
          } else {
            // Fallback for cultures without cache data
            return `${culture} ⏳ (checking cache...)`;
          }
        }).join(' • ');
        
        // Add cache performance info to prompt
        const cachePerformance = culturalCacheData.filter(c => c.cached).length;
        const totalCultures = profile.cultural_background.length;
        const cacheHitRate = totalCultures > 0 ? (cachePerformance / totalCultures * 100).toFixed(0) : '0';
        
        if (cachePerformance > 0) {
          const cacheInfo = `\n- Cache optimization: ${cachePerformance}/${totalCultures} cultures cached (${cacheHitRate}% hit rate)`;
          prompt += cacheInfo;
        }
        
        steps.push({
          step: '🌍',
          title: 'Cultural Intelligence Applied',
          content: cacheStatusDisplay,
          data: { 
            cultures: profile.cultural_background,
            cacheData: culturalCacheData,
            hitRate: `${cacheHitRate}%`,
            globalStats: cacheStats,
            note: `Real-time cache data: ${cachePerformance} cached, ${totalCultures - cachePerformance} fresh fetches`
          }
        });
        
        // Add cache intelligence insights if we have good data
        if (culturalCacheData.length > 0) {
          const avgComplexity = culturalCacheData.reduce((sum, c) => sum + c.complexity, 0) / culturalCacheData.length;
          const avgAuth = culturalCacheData.reduce((sum, c) => sum + c.authenticity_score, 0) / culturalCacheData.length;
          
          const insights = [];
          if (avgComplexity > 3.5) {
            insights.push("High-complexity cuisines detected - longer cook times expected");
          }
          if (avgAuth > 0.85) {
            insights.push("High authenticity scores - traditional recipes prioritized");
          }
          if (cachePerformance === totalCultures) {
            insights.push("All cultures cached - instant meal suggestions available");
          }
          
          if (insights.length > 0) {
            const insightsText = `\n- Intelligence insights: ${insights.join('; ')}`;
            prompt += insightsText;
            
            steps.push({
              step: '🧠',
              title: 'Cultural Cache Intelligence',
              content: insights.join(' • '),
              data: { 
                insights: insights,
                avgComplexity: avgComplexity.toFixed(1),
                avgAuthenticity: avgAuth.toFixed(2),
                reasoning: 'Cache analysis informs recipe selection and timing'
              }
            });
          }
        }
      }
    }

    // Step 6: Smart Difficulty & Time Analysis
    const targetDifficulty = 2; // Default difficulty (would come from user settings)
    const targetCookTime = 30;  // Default cook time (would come from user settings)
    
    // Mock difficulty analysis for different cultural cuisines (real system would calculate this)
    const difficultyAnalysis = profile?.cultural_background?.map((culture: string) => {
      const cacheData = culturalCacheData.find(c => c.culture === culture);
      const baseDifficulty = cacheData?.complexity || 2.5;
      
      // Smart difficulty adjustment logic
      let adjustedDifficulty = baseDifficulty;
      let timeEstimate = targetCookTime;
      let adjustmentNotes = [];
      
      if (baseDifficulty > targetDifficulty) {
        adjustedDifficulty = targetDifficulty;
        adjustmentNotes.push('simplified cooking methods');
        if (culture.toLowerCase() === 'chinese') {
          adjustmentNotes.push('stir-fry instead of complex braising');
        } else if (culture.toLowerCase() === 'italian') {
          adjustmentNotes.push('pasta over risotto techniques');
        }
      }
      
      // Estimate time based on difficulty and cultural complexity
      if (adjustedDifficulty <= 2) {
        timeEstimate = Math.min(timeEstimate, 25);
      } else if (adjustedDifficulty >= 4) {
        timeEstimate = Math.max(timeEstimate, 45);
      }
      
      return {
        culture,
        originalDifficulty: baseDifficulty,
        adjustedDifficulty,
        timeEstimate,
        adjustmentNotes
      };
    }) || [];
    
    if (difficultyAnalysis.length > 0) {
      const avgOriginalDifficulty = difficultyAnalysis.reduce((sum: number, c: any) => sum + c.originalDifficulty, 0) / difficultyAnalysis.length;
      const avgAdjustedDifficulty = difficultyAnalysis.reduce((sum: number, c: any) => sum + c.adjustedDifficulty, 0) / difficultyAnalysis.length;
      
      const difficultyText = `\n\nSMART DIFFICULTY OPTIMIZATION:\n- Target difficulty: ${targetDifficulty}/5, Target time: ${targetCookTime}min\n- Cultural average: ${avgOriginalDifficulty.toFixed(1)}/5 → ${avgAdjustedDifficulty.toFixed(1)}/5 (optimized)\n- Automatic recipe simplification applied where needed`;
      prompt += difficultyText;
      
      // Show which cuisines needed adjustment
      const adjustedCuisines = difficultyAnalysis.filter((c: any) => c.adjustedDifficulty < c.originalDifficulty);
      if (adjustedCuisines.length > 0) {
        const adjustmentDetails = adjustedCuisines.map((c: any) => 
          `${c.culture}: ${c.originalDifficulty.toFixed(1)} → ${c.adjustedDifficulty.toFixed(1)} (${c.adjustmentNotes.join(', ')})`
        ).join(' • ');
        
        steps.push({
          step: '⚡',
          title: 'Smart Difficulty Optimization',
          content: adjustmentDetails,
          data: {
            analysis: difficultyAnalysis,
            adjustedCount: adjustedCuisines.length,
            avgReduction: (avgOriginalDifficulty - avgAdjustedDifficulty).toFixed(1),
            note: 'Cooking time calculator automatically simplifies complex recipes'
          }
        });
      }
      
      // Time estimation summary
      const avgTimeEstimate = difficultyAnalysis.reduce((sum: number, c: any) => sum + c.timeEstimate, 0) / difficultyAnalysis.length;
      const timeEstimates = difficultyAnalysis.map((c: any) => c.timeEstimate);
      const timeAnalysisText = `\n- Estimated cook time: ${avgTimeEstimate.toFixed(0)}min average (${Math.min(...timeEstimates)}min-${Math.max(...timeEstimates)}min range)`;
      prompt += timeAnalysisText;
      
      steps.push({
        step: '⏱️',
        title: 'Intelligent Time Estimation',
        content: `${avgTimeEstimate.toFixed(0)}min average (${Math.min(...timeEstimates)}min-${Math.max(...timeEstimates)}min range)`,
        data: {
          timeEstimates: difficultyAnalysis.map((c: any) => ({ culture: c.culture, time: c.timeEstimate })),
          methodology: 'Based on cultural complexity, cooking methods, and ingredient prep requirements',
          note: 'Real-time analysis using cookingTimeCalculator.ts system'
        }
      });
    }

    // Step 7: JSON format
    const jsonFormat = `\n\nReturn ONLY valid JSON in this exact format:\n{\n  "meal_plan": {\n    "day_1": {\n      "breakfast": {...},\n      "lunch": {...},\n      "dinner": {...}\n    }\n  }\n}`;
    prompt += jsonFormat;
    
    steps.push({
      step: '📋',
      title: 'Response Format',
      content: 'Structured JSON meal plan format',
      data: { format: 'JSON' }
    });

    setPromptSteps(steps);
    setBuiltPrompt(prompt);
  };

  // Initialize ranking tests for each cultural background
  useEffect(() => {
    if (profile?.cultural_background && profile.cultural_background.length > 0) {
      const tests = profile.cultural_background.map((culture: string) => ({
        culture,
        status: 'idle' as const
      }));
      setRankingTests(tests);
    }
  }, [profile?.cultural_background]);

  // Test cultural meal ranking for a specific culture
  const testCulturalRanking = async (culture: string) => {
    setRankingTests(prev => prev.map(test => 
      test.culture === culture 
        ? { ...test, status: 'loading', error: undefined }
        : test
    ));

    try {
      // Build user profile for testing
      const testWeights = profile?.goal_weights || {
        cost: 0.8,
        health: 0.6,
        cultural: 0.9,
        variety: 0.4,
        time: 0.3
      };

      const userProfile = {
        cultural_preferences: { [culture]: 0.9 },
        priority_weights: {
          cultural: testWeights.cultural,
          health: testWeights.health,
          cost: testWeights.cost,
          time: testWeights.time,
          variety: testWeights.variety
        },
        dietary_restrictions: familyMembers.flatMap(m => m.dietaryRestrictions || []),
        preferences: familyMembers.flatMap(m => m.preferences || [])
      };

      // Add timeout to handle long AI processing times
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
      
      try {
        const response = await fetch('/api/test-cultural-ranking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 1, // Mock user ID
            cultures: [culture],
            userProfile,
            limit: 10 // Request all 10 meals with parallel processing
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Failed to test ranking: ${response.statusText}`);
        }

        const results = await response.json();
        console.log('Cultural ranking results:', results);
      
        setRankingTests(prev => prev.map(test => 
          test.culture === culture 
            ? { ...test, status: 'success', results }
            : test
        ));
      } catch (error: any) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - AI processing took too long');
        }
        throw error;
      }
    } catch (error) {
      console.error('Cultural ranking error:', error);
      setRankingTests(prev => prev.map(test => 
        test.culture === culture 
          ? { ...test, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' }
          : test
      ));
    }
  };

  // Rebuild prompt when profile, family members, or cultural cache data changes
  useEffect(() => {
    buildPromptFromProfile();
  }, [profile, familyMembers, culturalCacheData, culturalLoading]);

  if (!profile) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="text-center text-gray-500 py-8">
        Profile preview functionality simplified
      </div>
    </div>
  );
}