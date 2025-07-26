import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Target, Heart, DollarSign, Clock, Shuffle, Globe, Star, TrendingUp } from 'lucide-react';

interface WeightSettings {
  cultural: number;
  health: number;
  cost: number;
  time: number;
  variety: number;
}

interface RankedMeal {
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
}

interface DynamicMealRankingProps {
  culturalBackground?: string[];
}

export default function DynamicMealRanking({ culturalBackground = [] }: DynamicMealRankingProps) {
  const [weights, setWeights] = useState<WeightSettings>({
    cultural: 0.5,
    health: 0.5,
    cost: 0.5,
    time: 0.5,
    variety: 0.5
  });

  const [isUpdating, setIsUpdating] = useState(false);

  // Query for ranked meals based on current weights
  const { data: rankingData, isLoading, refetch } = useQuery({
    queryKey: ['test-cultural-ranking', weights],
    queryFn: async () => {
      const response = await apiRequest('/api/test-cultural-ranking', {
        method: 'POST',
        body: JSON.stringify({
          limit: 20,
          userProfile: {
            priority_weights: weights,
            cultural_preferences: culturalBackground.reduce((acc, cuisine) => ({
              ...acc,
              [cuisine]: 0.8
            }), {} as Record<string, number>),
            dietary_restrictions: [],
            preferences: []
          }
        })
      });
      return response;
    },
    enabled: true,
    staleTime: 30000 // Cache for 30 seconds
  });

  const handleWeightChange = (weightType: keyof WeightSettings, value: number[]) => {
    setWeights(prev => ({
      ...prev,
      [weightType]: value[0]
    }));
  };

  const handleUpdateRanking = async () => {
    setIsUpdating(true);
    await refetch();
    setIsUpdating(false);
  };

  const getWeightIcon = (type: keyof WeightSettings) => {
    const icons = {
      cultural: Globe,
      health: Heart,
      cost: DollarSign,
      time: Clock,
      variety: Shuffle
    };
    return icons[type];
  };

  const getWeightColor = (type: keyof WeightSettings) => {
    const colors = {
      cultural: 'text-blue-600',
      health: 'text-green-600', 
      cost: 'text-yellow-600',
      time: 'text-purple-600',
      variety: 'text-orange-600'
    };
    return colors[type];
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          Dynamic Meal Ranking System
        </CardTitle>
        <p className="text-sm text-gray-600">
          Adjust your preferences to see which cached meals rank highest
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Weight Controls */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Your Meal Planning Priorities</Label>
          {Object.entries(weights).map(([type, value]) => {
            const Icon = getWeightIcon(type as keyof WeightSettings);
            const colorClass = getWeightColor(type as keyof WeightSettings);
            
            return (
              <div key={type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${colorClass}`} />
                    <Label className="capitalize">{type}</Label>
                  </div>
                  <Badge variant="outline" className="font-mono">
                    {(value * 100).toFixed(0)}%
                  </Badge>
                </div>
                <Slider
                  value={[value]}
                  onValueChange={(newValue) => handleWeightChange(type as keyof WeightSettings, newValue)}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>
            );
          })}
          
          <Button 
            onClick={handleUpdateRanking}
            disabled={isUpdating || isLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-emerald-500 hover:from-purple-600 hover:to-emerald-600"
          >
            {isUpdating ? 'Reranking Meals...' : 'Update Meal Rankings'}
          </Button>
        </div>

        <Separator />

        {/* Ranked Meals Results */}
        <div className="space-y-4">
          <Label className="text-base font-medium">
            Top Ranked Meals ({rankingData?.rankedMeals?.length || 0} found)
          </Label>
          
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Analyzing meals with your preferences...</p>
            </div>
          )}

          {rankingData?.rankedMeals && rankingData.rankedMeals.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {rankingData.rankedMeals.slice(0, 10).map((rankedMeal: RankedMeal, index: number) => (
                <Card key={index} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            #{index + 1}
                          </Badge>
                          <h4 className="font-medium text-sm">{rankedMeal.meal.name}</h4>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {rankedMeal.meal.cuisine}
                          </Badge>
                          <Badge 
                            className={`text-xs ${getScoreColor(rankedMeal.total_score)}`}
                          >
                            {(rankedMeal.total_score * 100).toFixed(0)}% match
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{rankedMeal.meal.description}</p>
                        
                        {/* Individual Scores */}
                        <div className="grid grid-cols-4 gap-2 text-xs">
                          <div className="text-center">
                            <div className="text-blue-600 font-medium">
                              {(rankedMeal.meal.authenticity_score * 100).toFixed(0)}%
                            </div>
                            <div className="text-gray-500">Cultural</div>
                          </div>
                          <div className="text-center">
                            <div className="text-green-600 font-medium">
                              {(rankedMeal.meal.health_score * 100).toFixed(0)}%
                            </div>
                            <div className="text-gray-500">Health</div>
                          </div>
                          <div className="text-center">
                            <div className="text-yellow-600 font-medium">
                              {(rankedMeal.meal.cost_score * 100).toFixed(0)}%
                            </div>
                            <div className="text-gray-500">Cost</div>
                          </div>
                          <div className="text-center">
                            <div className="text-purple-600 font-medium">
                              {(rankedMeal.meal.time_score * 100).toFixed(0)}%
                            </div>
                            <div className="text-gray-500">Time</div>
                          </div>
                        </div>
                      </div>
                      <Star className={`h-4 w-4 ${index < 3 ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                    </div>
                    
                    {rankedMeal.ranking_explanation && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                        <strong>Why this ranks high:</strong> {rankedMeal.ranking_explanation}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            !isLoading && (
              <div className="text-center py-8 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No meals found with current preferences</p>
                <p className="text-sm">Try adjusting your weight settings above</p>
              </div>
            )
          )}

          {rankingData?.reasoning && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Label className="text-sm font-medium text-blue-900">AI Ranking Analysis:</Label>
              <p className="text-sm text-blue-800 mt-1">{rankingData.reasoning}</p>
              {rankingData.processingTime && (
                <p className="text-xs text-blue-600 mt-1">
                  Processed in {rankingData.processingTime}ms
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}