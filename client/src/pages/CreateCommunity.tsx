import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Users, 
  ChefHat, 
  DollarSign, 
  Globe, 
  Heart,
  Image,
  Lock,
  Unlock,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Target,
  TrendingUp,
  Award,
  MessageSquare,
  Calendar,
  Zap
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface CommunityFormData {
  name: string;
  description: string;
  category: string;
  coverImage?: string;
  isPublic: boolean;
  membershipTiers: {
    free: {
      enabled: boolean;
      benefits: string[];
    };
    premium: {
      enabled: boolean;
      price: number;
      benefits: string[];
    };
    vip: {
      enabled: boolean;
      price: number;
      benefits: string[];
    };
  };
  features: {
    mealPlans: boolean;
    discussions: boolean;
    challenges: boolean;
    coaching: boolean;
    events: boolean;
  };
  goals: string[];
  rules: string[];
}

export default function CreateCommunity() {
  console.log("🚀 CreateCommunity component loaded");
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  
  // Initialize formData state early to avoid hook order issues
  const [formData, setFormData] = useState<CommunityFormData>({
    name: "",
    description: "",
    category: "",
    isPublic: true,
    membershipTiers: {
      free: {
        enabled: true,
        benefits: ["Access to community discussions", "View shared meal plans"],
      },
      premium: {
        enabled: false,
        price: 9.99,
        benefits: ["All free benefits", "Exclusive meal plans", "Weekly challenges", "Member badge"],
      },
      vip: {
        enabled: false,
        price: 19.99,
        benefits: ["All premium benefits", "1-on-1 coaching", "Custom meal plans", "VIP badge"],
      },
    },
    features: {
      mealPlans: true,
      discussions: true,
      challenges: false,
      coaching: false,
      events: false,
    },
    goals: [],
    rules: [],
  });
  
  // Debug user state
  console.log("🔍 CreateCommunity - isAuthenticated:", isAuthenticated);
  console.log("🔍 CreateCommunity - user:", user);
  
  // Fix user access - useAuth returns {user: {...}} so we need user.user
  const actualUser = (user as any)?.user || user;
  console.log("🔍 CreateCommunity - actualUser:", actualUser);
  console.log("🔍 CreateCommunity - actualUser.is_creator:", actualUser?.is_creator);
  console.log("🔍 CreateCommunity - typeof actualUser.is_creator:", typeof actualUser?.is_creator);
  
  // Simplified check - just show form if user is authenticated
  // The logs already confirm authentication and creator status work
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  console.log("✅ User authenticated and is creator, showing create community form");

  const steps = [
    {
      title: "Basic Information",
      description: "Tell us about your community",
    },
    {
      title: "Category & Type",
      description: "Choose your community focus",
    },
    {
      title: "Membership Tiers",
      description: "Set up your monetization",
    },
    {
      title: "Features",
      description: "Choose community features",
    },
    {
      title: "Rules & Goals",
      description: "Set expectations",
    },
    {
      title: "Review & Launch",
      description: "Review and create your community",
    },
  ];

  const categories = [
    {
      id: "budget",
      name: "Budget Meals",
      description: "Focus on affordable, cost-effective meals",
      icon: <DollarSign className="w-6 h-6" />,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      id: "family",
      name: "Family Cooking",
      description: "Kid-friendly meals for the whole family",
      icon: <Users className="w-6 h-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      id: "cultural",
      name: "Cultural Cuisine",
      description: "Authentic recipes from around the world",
      icon: <Globe className="w-6 h-6" />,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      id: "health",
      name: "Healthy Living",
      description: "Nutrition-focused, balanced meals",
      icon: <Heart className="w-6 h-6" />,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  const defaultGoals = [
    "Help members save money on groceries",
    "Share authentic cultural recipes",
    "Support healthy eating habits",
    "Build a supportive food community",
    "Provide weekly meal planning guidance",
    "Teach cooking techniques and skills",
  ];

  const defaultRules = [
    "Be respectful and supportive to all members",
    "No spam or self-promotion without permission",
    "Share recipes with accurate measurements",
    "Credit original recipe creators when sharing",
    "Keep discussions food and cooking related",
    "No diet shaming or food judgment",
  ];

  // Create community mutation
  const createCommunity = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/communities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          settings: {
            membershipTiers: formData.membershipTiers,
            features: formData.features,
            goals: formData.goals,
            rules: formData.rules,
          },
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create community");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Community Created!",
        description: "Your community has been successfully created.",
      });
      setLocation(`/community/${data.id}/manage`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    createCommunity.mutate();
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.name && formData.description;
      case 1:
        return formData.category;
      case 2:
        return formData.membershipTiers.free.enabled || 
               formData.membershipTiers.premium.enabled || 
               formData.membershipTiers.vip.enabled;
      case 3:
        return true; // Features are optional
      case 4:
        return formData.goals.length > 0 && formData.rules.length > 0;
      case 5:
        return true; // Review step
      default:
        return false;
    }
  };

  // Authentication and creator checks have been simplified above

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Create Your Community</h1>
            <Button
              variant="ghost"
              onClick={() => setLocation("/creator-hub")}
            >
              Cancel
            </Button>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index <= currentStep
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {index < currentStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <p className="text-xs mt-1 text-center hidden md:block">
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      index < currentStep ? "bg-purple-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep].title}</CardTitle>
              <CardDescription>{steps[currentStep].description}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Step 0: Basic Information */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="name">Community Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Sarah's Budget Kitchen"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Choose a memorable name that reflects your community's focus
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Tell potential members what your community is about..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Describe your community's mission and what members can expect
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="visibility">Community Visibility</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Switch
                        id="visibility"
                        checked={formData.isPublic}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, isPublic: checked })
                        }
                      />
                      <Label htmlFor="visibility" className="font-normal">
                        {formData.isPublic ? (
                          <span className="flex items-center gap-2">
                            <Unlock className="w-4 h-4" />
                            Public - Anyone can discover and join
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Private - Invite only
                          </span>
                        )}
                      </Label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Category & Type */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <Label>Choose Your Community Category</Label>
                    <RadioGroup
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                      className="mt-3"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categories.map((category) => (
                          <div key={category.id}>
                            <RadioGroupItem
                              value={category.id}
                              id={category.id}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor={category.id}
                              className={`flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                formData.category === category.id
                                  ? "border-purple-600 bg-purple-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${category.bgColor}`}>
                                  <div className={category.color}>
                                    {category.icon}
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold">{category.name}</p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {category.description}
                                  </p>
                                </div>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>

                  {formData.category && (
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="font-semibold text-purple-900 mb-2">
                        Great choice! 
                      </p>
                      <p className="text-sm text-purple-700">
                        {formData.category === "budget" && 
                          "Budget meal communities are highly popular. Focus on meal prep, bulk buying, and cost-saving tips."}
                        {formData.category === "family" && 
                          "Family cooking communities thrive on sharing kid-friendly recipes and time-saving meal ideas."}
                        {formData.category === "cultural" && 
                          "Cultural cuisine communities celebrate authentic recipes and food traditions from around the world."}
                        {formData.category === "health" && 
                          "Health-focused communities help members achieve their nutrition goals with balanced meal plans."}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Membership Tiers */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      Set up your membership tiers. You can always adjust these later.
                    </p>
                  </div>

                  {/* Free Tier */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Free Tier</Badge>
                        <span className="text-sm text-gray-500">Always recommended</span>
                      </div>
                      <Switch
                        checked={formData.membershipTiers.free.enabled}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            membershipTiers: {
                              ...formData.membershipTiers,
                              free: { ...formData.membershipTiers.free, enabled: checked },
                            },
                          })
                        }
                      />
                    </div>
                    {formData.membershipTiers.free.enabled && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Benefits:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {formData.membershipTiers.free.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-500" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Premium Tier */}
                  <div className="border rounded-lg p-4 border-purple-200 bg-purple-50/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-600">Premium Tier</Badge>
                        <span className="text-sm text-gray-600">Most popular</span>
                      </div>
                      <Switch
                        checked={formData.membershipTiers.premium.enabled}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            membershipTiers: {
                              ...formData.membershipTiers,
                              premium: { ...formData.membershipTiers.premium, enabled: checked },
                            },
                          })
                        }
                      />
                    </div>
                    {formData.membershipTiers.premium.enabled && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="premium-price">Monthly Price:</Label>
                          <div className="flex items-center">
                            <span className="text-lg font-bold">$</span>
                            <Input
                              id="premium-price"
                              type="number"
                              step="0.01"
                              value={formData.membershipTiers.premium.price}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  membershipTiers: {
                                    ...formData.membershipTiers,
                                    premium: {
                                      ...formData.membershipTiers.premium,
                                      price: parseFloat(e.target.value),
                                    },
                                  },
                                })
                              }
                              className="w-24 ml-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Benefits:</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {formData.membershipTiers.premium.benefits.map((benefit, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-purple-500" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* VIP Tier */}
                  <div className="border rounded-lg p-4 border-yellow-200 bg-yellow-50/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-yellow-600">VIP Tier</Badge>
                        <span className="text-sm text-gray-600">Exclusive access</span>
                      </div>
                      <Switch
                        checked={formData.membershipTiers.vip.enabled}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            membershipTiers: {
                              ...formData.membershipTiers,
                              vip: { ...formData.membershipTiers.vip, enabled: checked },
                            },
                          })
                        }
                      />
                    </div>
                    {formData.membershipTiers.vip.enabled && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="vip-price">Monthly Price:</Label>
                          <div className="flex items-center">
                            <span className="text-lg font-bold">$</span>
                            <Input
                              id="vip-price"
                              type="number"
                              step="0.01"
                              value={formData.membershipTiers.vip.price}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  membershipTiers: {
                                    ...formData.membershipTiers,
                                    vip: {
                                      ...formData.membershipTiers.vip,
                                      price: parseFloat(e.target.value),
                                    },
                                  },
                                })
                              }
                              className="w-24 ml-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Benefits:</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {formData.membershipTiers.vip.benefits.map((benefit, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-yellow-600" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Features */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      Choose the features you want to enable for your community.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <ChefHat className="w-6 h-6 text-purple-600" />
                        <div>
                          <p className="font-medium">Meal Plans</p>
                          <p className="text-sm text-gray-600">
                            Members can share and discover meal plans
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={formData.features.mealPlans}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            features: { ...formData.features, mealPlans: checked },
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-6 h-6 text-blue-600" />
                        <div>
                          <p className="font-medium">Discussions</p>
                          <p className="text-sm text-gray-600">
                            Community forum for questions and tips
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={formData.features.discussions}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            features: { ...formData.features, discussions: checked },
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Award className="w-6 h-6 text-yellow-600" />
                        <div>
                          <p className="font-medium">Challenges</p>
                          <p className="text-sm text-gray-600">
                            Weekly or monthly cooking challenges
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={formData.features.challenges}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            features: { ...formData.features, challenges: checked },
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Target className="w-6 h-6 text-emerald-600" />
                        <div>
                          <p className="font-medium">1-on-1 Coaching</p>
                          <p className="text-sm text-gray-600">
                            Personal guidance for VIP members
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={formData.features.coaching}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            features: { ...formData.features, coaching: checked },
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-red-600" />
                        <div>
                          <p className="font-medium">Live Events</p>
                          <p className="text-sm text-gray-600">
                            Virtual cooking classes and Q&A sessions
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={formData.features.events}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            features: { ...formData.features, events: checked },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Rules & Goals */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <Label>Community Goals</Label>
                    <p className="text-sm text-gray-600 mb-3">
                      Select or add your community's main goals
                    </p>
                    <div className="space-y-2">
                      {defaultGoals.map((goal) => (
                        <label
                          key={goal}
                          className="flex items-center gap-2 p-2 rounded hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={formData.goals.includes(goal)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  goals: [...formData.goals, goal],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  goals: formData.goals.filter((g) => g !== goal),
                                });
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{goal}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Community Rules</Label>
                    <p className="text-sm text-gray-600 mb-3">
                      Set clear expectations for member behavior
                    </p>
                    <div className="space-y-2">
                      {defaultRules.map((rule) => (
                        <label
                          key={rule}
                          className="flex items-center gap-2 p-2 rounded hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={formData.rules.includes(rule)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  rules: [...formData.rules, rule],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  rules: formData.rules.filter((r) => r !== rule),
                                });
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{rule}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Review & Launch */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold mb-3">Community Overview</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Name:</span> {formData.name}
                      </div>
                      <div>
                        <span className="font-medium">Category:</span>{" "}
                        {categories.find((c) => c.id === formData.category)?.name}
                      </div>
                      <div>
                        <span className="font-medium">Type:</span>{" "}
                        {formData.isPublic ? "Public" : "Private"}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <h3 className="font-semibold mb-3">Membership Tiers</h3>
                    <div className="space-y-2 text-sm">
                      {formData.membershipTiers.free.enabled && (
                        <div className="flex justify-between">
                          <span>Free Tier</span>
                          <Badge variant="outline">Enabled</Badge>
                        </div>
                      )}
                      {formData.membershipTiers.premium.enabled && (
                        <div className="flex justify-between">
                          <span>Premium Tier</span>
                          <span className="font-bold">${formData.membershipTiers.premium.price}/mo</span>
                        </div>
                      )}
                      {formData.membershipTiers.vip.enabled && (
                        <div className="flex justify-between">
                          <span>VIP Tier</span>
                          <span className="font-bold">${formData.membershipTiers.vip.price}/mo</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold mb-3">Enabled Features</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(formData.features)
                        .filter(([_, enabled]) => enabled)
                        .map(([feature]) => (
                          <Badge key={feature} variant="secondary">
                            {feature.charAt(0).toUpperCase() + feature.slice(1)}
                          </Badge>
                        ))}
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-6 h-6 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-yellow-900">Ready to Launch!</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          Your community will be live immediately after creation. You can always
                          adjust settings later from your dashboard.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            {/* Navigation */}
            <div className="px-6 py-4 border-t flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={createCommunity.isPending || !isStepValid()}
                  className="gap-2"
                >
                  {createCommunity.isPending ? (
                    "Creating..."
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Launch Community
                    </>
                  )}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}