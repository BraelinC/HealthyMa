import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Star, 
  Globe, 
  Heart, 
  DollarSign, 
  Clock, 
  Shuffle,
  Target,
  Zap,
  ChefHat
} from 'lucide-react';
import SmartProfileQuestionnaire from '@/components/SmartProfileQuestionnaire';
import type { GoalWeights } from '@shared/schema';

interface IntelligentMealSelectorProps {
  userProfile: any;
  onMealSelected: (selectedMeal: any, weights: GoalWeights) => void;
  onSkip: () => void;
}

interface RankedMeal {
  meal: {
    name: string;
    cuisine: string;
    description: string;
    authenticity_score: number;
  };
  total_score: number;
  component_scores: {
    cultural_score: number;
    health_score: number;
    cost_score: number;
    time_score: number;
  };
  ranking_explanation: string;
}

export default function IntelligentMealSelector({ 
  userProfile, 
  onMealSelected, 
  onSkip 
}: IntelligentMealSelectorProps) {
  const [step, setStep] = useState<'questionnaire' | 'meal-selection'>('questionnaire');
  const [calculatedWeights, setCalculatedWeights] = useState<GoalWeights | null>(null);
  const [rankedMeals, setRankedMeals] = useState<RankedMeal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<RankedMeal | null>(null);

  const handleQuestionnaireComplete = async (weights: GoalWeights) => {
    console.log('📊 Questionnaire completed with weights:', weights);
    setCalculatedWeights(weights);
    setIsLoading(true);
    
    try {
      // Get the user's cultural preferences (default to a mix if not available)
      const culturalPreferences = userProfile?.cultural_preferences || { 
        Italian: 0.8, 
        Chinese: 0.7, 
        Indian: 0.6 
      };

      // Create a test profile with the calculated weights
      const testProfile = {
        cultural_preferences: culturalPreferences,
        priority_weights: {
          cultural: weights.cultural,
          health: weights.health,
          cost: weights.cost,
          time: weights.time,
          variety: weights.variety || 0.5
        },
        dietary_restrictions: userProfile?.dietary_restrictions || [],
        preferences: userProfile?.preferences || []
      };

      console.log('🔄 Calling API with profile:', testProfile);

      // Test with the first available culture to get meal recommendations
      const primaryCulture = Object.keys(culturalPreferences)[0] || 'Italian';

      const response = await fetch('/api/test-cultural-ranking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 1,
          cultures: [primaryCulture],
          userProfile: testProfile,
          limit: 10
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        throw new Error(`API Error: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ API Response:', result);
      
      // Validate the response structure
      if (result.rankedMeals && Array.isArray(result.rankedMeals)) {
        setRankedMeals(result.rankedMeals);
        console.log(`📋 Got ${result.rankedMeals.length} ranked meals`);
      } else {
        console.warn('⚠️ Invalid response structure:', result);
        setRankedMeals([]);
      }
      
      setStep('meal-selection');
    } catch (error) {
      console.error('❌ Error getting meal recommendations:', error);
      // Still proceed to meal selection but with empty results
      setRankedMeals([]);
      setStep('meal-selection');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionnaireSkip = () => {
    // Use balanced weights as default
    const balancedWeights: GoalWeights = {
      cost: 0.5,
      health: 0.5,
      cultural: 0.5,
      variety: 0.5,
      time: 0.5
    };
    setCalculatedWeights(balancedWeights);
    onSkip();
  };

  const handleMealSelection = (meal: RankedMeal) => {
    setSelectedMeal(meal);
    onMealSelected(meal, calculatedWeights!);
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getWeightIcon = (weight: keyof GoalWeights) => {
    const icons = {
      cultural: Globe,
      health: Heart,
      cost: DollarSign,
      time: Clock,
      variety: Shuffle
    };
    return icons[weight];
  };

  if (step === 'questionnaire') {
    return (
      <SmartProfileQuestionnaire
        onComplete={handleQuestionnaireComplete}
        onSkip={handleQuestionnaireSkip}
        initialWeights={calculatedWeights || undefined}
      />
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Finding the perfect meals for your preferences...</p>
            <p className="text-sm text-gray-500 mt-2">Using AI to analyze your ideal meal matches</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChefHat className="h-5 w-5 text-purple-600" />
          Select Your Base Meal
        </CardTitle>
        <p className="text-sm text-gray-600">
          Based on your preferences, here are meals that match your priorities. 
          Select one to use as a foundation for your meal plan.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Your Weight Priorities */}
        {calculatedWeights && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Your Meal Planning Priorities
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {Object.entries(calculatedWeights).map(([goal, weight]) => {
                const Icon = getWeightIcon(goal as keyof GoalWeights);
                return (
                  <div key={goal} className="text-center">
                    <Icon className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                    <div className="text-xs text-blue-800 capitalize">{goal}</div>
                    <Badge variant="outline" className={`text-xs mt-1 ${getScoreColor(weight)}`}>
                      {Math.round(weight * 100)}%
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Separator />

        {/* Recommended Meals */}
        {rankedMeals.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              Recommended Base Meals (Top {Math.min(rankedMeals.length, 5)})
            </h4>
            <div className="grid gap-3">
              {rankedMeals.slice(0, 5).map((rankedMeal, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all hover:border-purple-300 ${
                    selectedMeal === rankedMeal ? 'border-purple-400 bg-purple-50' : ''
                  }`}
                  onClick={() => handleMealSelection(rankedMeal)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="font-medium text-gray-900 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700">
                            #{index + 1}
                          </Badge>
                          {rankedMeal.meal.name}
                        </h5>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <Globe className="h-3 w-3" />
                          {rankedMeal.meal.cuisine} cuisine
                        </p>
                      </div>
                      <Badge className={`${getScoreColor(rankedMeal.total_score)} font-medium`}>
                        {Math.round(rankedMeal.total_score * 100)}%
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">
                      {rankedMeal.meal.description ? 
                        `${rankedMeal.meal.description.substring(0, 150)}...` : 
                        'No description available'
                      }
                    </p>

                    {/* Score Breakdown */}
                    {rankedMeal.component_scores ? (
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div>
                          <Globe className="h-3 w-3 mx-auto mb-1 text-purple-600" />
                          <div className="text-xs text-gray-600">Cultural</div>
                          <Badge variant="outline" className={`text-xs ${getScoreColor(rankedMeal.component_scores.cultural_score || 0)}`}>
                            {Math.round((rankedMeal.component_scores.cultural_score || 0) * 100)}%
                          </Badge>
                        </div>
                        <div>
                          <Heart className="h-3 w-3 mx-auto mb-1 text-red-600" />
                          <div className="text-xs text-gray-600">Health</div>
                          <Badge variant="outline" className={`text-xs ${getScoreColor(rankedMeal.component_scores.health_score || 0)}`}>
                            {Math.round((rankedMeal.component_scores.health_score || 0) * 100)}%
                          </Badge>
                        </div>
                        <div>
                          <DollarSign className="h-3 w-3 mx-auto mb-1 text-green-600" />
                          <div className="text-xs text-gray-600">Cost</div>
                          <Badge variant="outline" className={`text-xs ${getScoreColor(rankedMeal.component_scores.cost_score || 0)}`}>
                            {Math.round((rankedMeal.component_scores.cost_score || 0) * 100)}%
                          </Badge>
                        </div>
                        <div>
                          <Clock className="h-3 w-3 mx-auto mb-1 text-blue-600" />
                          <div className="text-xs text-gray-600">Time</div>
                          <Badge variant="outline" className={`text-xs ${getScoreColor(rankedMeal.component_scores.time_score || 0)}`}>
                            {Math.round((rankedMeal.component_scores.time_score || 0) * 100)}%
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <p className="text-xs text-gray-500">Score breakdown not available</p>
                        <p className="text-xs text-gray-400">Overall score: {Math.round(rankedMeal.total_score * 100)}%</p>
                      </div>
                    )}

                    {selectedMeal === rankedMeal && (
                      <div className="mt-3 p-2 bg-purple-100 rounded-lg">
                        <p className="text-xs text-purple-800 flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          This meal will be used as a foundation for generating similar recipes in your meal plan
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <ChefHat className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-2">Unable to load meal recommendations</p>
            <p className="text-sm text-gray-500">You can still proceed with your calculated preferences</p>
          </div>
        )}

        {/* Navigation */}
        <Separator />
        <div className="flex justify-between gap-4">
          <Button 
            onClick={() => setStep('questionnaire')} 
            variant="outline"
          >
            Back to Questions
          </Button>
          
          <div className="flex gap-2">
            <Button onClick={onSkip} variant="outline">
              Skip Selection
            </Button>
            {selectedMeal && (
              <Button 
                onClick={() => handleMealSelection(selectedMeal)}
                className="bg-gradient-to-r from-purple-500 to-emerald-500 hover:from-purple-600 hover:to-emerald-600 text-white border-0"
              >
                Use This Base Meal
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}