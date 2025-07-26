import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronRight, 
  ChevronLeft, 
  Target, 
  DollarSign, 
  Heart, 
  Globe, 
  Shuffle, 
  Clock,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import type { GoalWeights } from '@shared/schema';

interface QuestionnaireResult {
  weights: GoalWeights;
  answers: Record<string, string[]>;
  selectedOptions: Array<{
    questionId: string;
    questionTitle: string;
    optionId: string;
    optionLabel: string;
    optionDescription: string;
  }>;
}

interface SmartProfileQuestionnaireProps {
  onComplete: (result: QuestionnaireResult) => void;
  onSkip: () => void;
  initialWeights?: GoalWeights;
  initialAnswers?: Record<string, string[]>;
}

interface QuestionOption {
  id: string;
  label: string;
  description: string;
  weights: Partial<GoalWeights>;
  icon: React.ComponentType<{ className?: string }>;
}

interface Question {
  id: string;
  title: string;
  description: string;
  options: QuestionOption[];
  allowMultiple?: boolean;
}

const questions: Question[] = [
  {
    id: 'primary-focus',
    title: 'What\'s your main meal planning focus?',
    description: 'Choose the most important factor when planning meals',
    options: [
      {
        id: 'budget',
        label: 'Budget-Friendly',
        description: 'Save money on groceries and meal costs',
        weights: { cost: 0.8, health: 0.6, time: 0.5, variety: 0.4, cultural: 0.4 },
        icon: DollarSign
      },
      {
        id: 'health',
        label: 'Health & Nutrition',
        description: 'Focus on nutritious, balanced meals',
        weights: { health: 0.8, cost: 0.4, time: 0.5, variety: 0.6, cultural: 0.5 },
        icon: Heart
      },
      {
        id: 'time',
        label: 'Quick & Easy',
        description: 'Minimize prep and cooking time',
        weights: { time: 0.8, cost: 0.6, health: 0.5, variety: 0.4, cultural: 0.4 },
        icon: Clock
      },
      {
        id: 'variety',
        label: 'Food Variety',
        description: 'Try diverse cuisines and ingredients',
        weights: { variety: 0.8, cultural: 0.7, health: 0.6, cost: 0.4, time: 0.5 },
        icon: Shuffle
      }
    ]
  },
  {
    id: 'lifestyle',
    title: 'Which describes your lifestyle best?',
    description: 'This helps us adjust your meal planning priorities',
    options: [
      {
        id: 'busy-professional',
        label: 'Busy Professional',
        description: 'Limited time, value convenience',
        weights: { time: 0.7, cost: 0.5, health: 0.6 },
        icon: Clock
      },
      {
        id: 'health-focused',
        label: 'Health-Conscious',
        description: 'Prioritize nutrition and wellness',
        weights: { health: 0.8, variety: 0.6, cost: 0.4 },
        icon: Heart
      },
      {
        id: 'budget-conscious',
        label: 'Budget-Conscious',
        description: 'Need to manage food expenses carefully',
        weights: { cost: 0.8, time: 0.6, health: 0.5 },
        icon: DollarSign
      },
      {
        id: 'food-explorer',
        label: 'Food Explorer',
        description: 'Love trying new cuisines and flavors',
        weights: { variety: 0.8, cultural: 0.8, health: 0.5 },
        icon: Globe
      }
    ]
  },
  {
    id: 'cooking-preferences',
    title: 'What\'s your cooking style?',
    description: 'Tell us about your cooking preferences',
    allowMultiple: true,
    options: [
      {
        id: 'quick-meals',
        label: 'Quick 15-minute meals',
        description: 'Prefer fast preparation',
        weights: { time: 0.3 },
        icon: Clock
      },
      {
        id: 'batch-cooking',
        label: 'Batch cooking/meal prep',
        description: 'Cook in large batches',
        weights: { time: 0.2, cost: 0.2 },
        icon: Target
      },
      {
        id: 'from-scratch',
        label: 'Cook from scratch',
        description: 'Make everything fresh',
        weights: { health: 0.3, cost: 0.1 },
        icon: Heart
      },
      {
        id: 'cultural-dishes',
        label: 'Traditional cultural dishes',
        description: 'Cook heritage recipes',
        weights: { cultural: 0.3 },
        icon: Globe
      }
    ]
  }
];

const presetScenarios = [
  {
    name: 'Budget Family',
    description: 'Large family, tight budget, need quick meals',
    weights: { cost: 0.8, time: 0.7, health: 0.6, variety: 0.4, cultural: 0.4 }
  },
  {
    name: 'Health Enthusiast',
    description: 'Prioritize nutrition, willing to spend time/money',
    weights: { health: 0.9, variety: 0.7, cultural: 0.6, cost: 0.3, time: 0.4 }
  },
  {
    name: 'Busy Professional',
    description: 'Limited time, decent budget, want convenience',
    weights: { time: 0.8, cost: 0.5, health: 0.6, variety: 0.5, cultural: 0.4 }
  },
  {
    name: 'Cultural Explorer',
    description: 'Love trying different cuisines and flavors',
    weights: { cultural: 0.8, variety: 0.8, health: 0.6, cost: 0.5, time: 0.5 }
  },
  {
    name: 'Balanced Approach',
    description: 'Want equal consideration of all factors',
    weights: { cost: 0.5, health: 0.5, cultural: 0.5, variety: 0.5, time: 0.5 }
  }
];

export default function SmartProfileQuestionnaire({ 
  onComplete, 
  onSkip, 
  initialWeights,
  initialAnswers 
}: SmartProfileQuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>(initialAnswers || {});
  const [showPresets, setShowPresets] = useState(false);
  const [calculatedWeights, setCalculatedWeights] = useState<GoalWeights>(
    initialWeights || { cost: 0.5, health: 0.5, cultural: 0.5, variety: 0.5, time: 0.5 }
  );

  const currentQuestion = questions[currentStep];
  const isLastQuestion = currentStep === questions.length - 1;

  const handleOptionSelect = (questionId: string, optionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const newAnswers = { ...answers };
    
    if (question.allowMultiple) {
      const current = newAnswers[questionId] || [];
      if (current.includes(optionId)) {
        newAnswers[questionId] = current.filter(id => id !== optionId);
      } else {
        newAnswers[questionId] = [...current, optionId];
      }
    } else {
      newAnswers[questionId] = [optionId];
    }

    setAnswers(newAnswers);
    
    // Recalculate weights based on all answers
    updateWeightsFromAnswers(newAnswers);
  };

  const updateWeightsFromAnswers = (currentAnswers: Record<string, string[]>) => {
    let newWeights: GoalWeights = { cost: 0, health: 0, cultural: 0, variety: 0, time: 0 };
    let totalInfluence = 0;

    // Process each answer
    Object.entries(currentAnswers).forEach(([questionId, optionIds]) => {
      const question = questions.find(q => q.id === questionId);
      if (!question) return;

      optionIds.forEach(optionId => {
        const option = question.options.find(opt => opt.id === optionId);
        if (!option) return;

        // Add weighted influence based on question type
        const influence = questionId === 'primary-focus' ? 2 : questionId === 'lifestyle' ? 1.5 : 0.5;
        totalInfluence += influence;

        Object.entries(option.weights).forEach(([key, value]) => {
          newWeights[key as keyof GoalWeights] += (value || 0) * influence;
        });
      });
    });

    // Normalize weights
    if (totalInfluence > 0) {
      Object.keys(newWeights).forEach(key => {
        newWeights[key as keyof GoalWeights] = Math.min(
          newWeights[key as keyof GoalWeights] / totalInfluence, 
          1
        );
      });
    } else {
      // Default balanced weights
      newWeights = { cost: 0.5, health: 0.5, cultural: 0.5, variety: 0.5, time: 0.5 };
    }

    setCalculatedWeights(newWeights);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Build selected options array
      const selectedOptions: Array<{
        questionId: string;
        questionTitle: string;
        optionId: string;
        optionLabel: string;
        optionDescription: string;
      }> = [];

      Object.entries(answers).forEach(([questionId, optionIds]) => {
        const question = questions.find(q => q.id === questionId);
        if (!question) return;

        optionIds.forEach(optionId => {
          const option = question.options.find(opt => opt.id === optionId);
          if (option) {
            selectedOptions.push({
              questionId,
              questionTitle: question.title,
              optionId,
              optionLabel: option.label,
              optionDescription: option.description
            });
          }
        });
      });

      onComplete({
        weights: calculatedWeights,
        answers,
        selectedOptions
      });
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePresetSelect = (preset: typeof presetScenarios[0]) => {
    onComplete({
      weights: preset.weights,
      answers: {},
      selectedOptions: [{
        questionId: 'preset',
        questionTitle: 'Quick Setup Preset',
        optionId: preset.name.toLowerCase().replace(/\s+/g, '-'),
        optionLabel: preset.name,
        optionDescription: preset.description
      }]
    });
  };

  const getWeightColor = (weight: number) => {
    if (weight >= 0.7) return 'text-green-600 bg-green-100';
    if (weight >= 0.5) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getWeightLabel = (weight: number) => {
    if (weight >= 0.8) return 'Very High';
    if (weight >= 0.6) return 'High';
    if (weight >= 0.4) return 'Medium';
    return 'Low';
  };

  const goalIcons = {
    cost: DollarSign,
    health: Heart,
    cultural: Globe,
    variety: Shuffle,
    time: Clock
  };

  if (showPresets) {
    return (
      <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Quick Setup - Choose a Scenario
          </CardTitle>
          <p className="text-sm text-gray-600">
            Pick a preset that matches your situation, or go back to the questionnaire
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {presetScenarios.map((preset) => (
              <Card 
                key={preset.name}
                className="cursor-pointer hover:border-purple-300 transition-colors"
                onClick={() => handlePresetSelect(preset)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{preset.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{preset.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 mt-1" />
                  </div>
                  <div className="flex gap-2 mt-3">
                    {Object.entries(preset.weights).map(([goal, weight]) => {
                      const Icon = goalIcons[goal as keyof typeof goalIcons];
                      return (
                        <Badge key={goal} variant="outline" className={`text-xs ${getWeightColor(weight)}`}>
                          <Icon className="h-3 w-3 mr-1" />
                          {getWeightLabel(weight)}
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Separator />
          
          <div className="flex gap-2">
            <Button onClick={() => setShowPresets(false)} variant="outline" className="flex-1">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Questions
            </Button>
            <Button onClick={onSkip} variant="outline" className="flex-1">
              Skip Setup
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Smart Profile Setup
              <Badge variant="outline">{currentStep + 1} of {questions.length}</Badge>
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Answer a few questions to set up intelligent meal planning priorities
            </p>
          </div>
          <Button onClick={() => setShowPresets(true)} variant="outline" size="sm">
            <HelpCircle className="h-4 w-4 mr-2" />
            Quick Setup
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {currentQuestion.title}
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            {currentQuestion.description}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option) => {
            const isSelected = answers[currentQuestion.id]?.includes(option.id) || false;
            const Icon = option.icon;
            
            return (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-purple-300 bg-purple-50' 
                    : 'hover:border-gray-300'
                }`}
                onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      isSelected ? 'bg-purple-200' : 'bg-gray-100'
                    }`}>
                      <Icon className={`h-4 w-4 ${
                        isSelected ? 'text-purple-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{option.label}</span>
                        {isSelected && <CheckCircle className="h-4 w-4 text-purple-600" />}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Current weights preview */}
        {Object.keys(answers).length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-3">Your Current Priorities</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {Object.entries(calculatedWeights).map(([goal, weight]) => {
                const Icon = goalIcons[goal as keyof typeof goalIcons];
                return (
                  <div key={goal} className="text-center">
                    <Icon className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                    <div className="text-xs text-blue-800 capitalize">{goal}</div>
                    <Badge variant="outline" className={`text-xs mt-1 ${getWeightColor(weight)}`}>
                      {Math.round(weight * 100)}%
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button onClick={handleBack} variant="outline">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <Button onClick={onSkip} variant="outline">
              Skip Setup
            </Button>
          </div>
          
          <Button 
            onClick={handleNext}
            disabled={!answers[currentQuestion.id]?.length}
            className="bg-gradient-to-r from-purple-500 to-emerald-500 hover:from-purple-600 hover:to-emerald-600 text-white border-0"
          >
            {isLastQuestion ? 'Complete Setup' : 'Next'}
            {!isLastQuestion && <ChevronRight className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}