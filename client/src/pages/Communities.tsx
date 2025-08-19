import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, TrendingUp, Plus, Search, ChefHat, DollarSign, Globe, Heart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

interface Community {
  id: number;
  name: string;
  description: string;
  creator_id: string;
  cover_image?: string;
  category: string;
  member_count: number;
  is_public: boolean;
  created_at: string;
  isMember?: boolean;
}

interface SharedMealPlan {
  id: number;
  title: string;
  description?: string;
  preview_images: string[];
  metrics: {
    cost_per_serving: number;
    total_prep_time: number;
    average_difficulty: number;
    nutrition_score: number;
  };
  likes: number;
  tries: number;
  success_rate?: number;
  creator?: {
    id: string;
    name: string;
    profileImageUrl?: string;
  };
}

interface Creator {
  profile: {
    id: number;
    bio?: string;
    follower_count: number;
    total_plans_shared: number;
    average_rating?: number;
    verified_nutritionist: boolean;
  };
  user: {
    id: string;
    name: string;
    email: string;
    profileImageUrl?: string;
  };
}

const categoryIcons = {
  budget: <DollarSign className="w-4 h-4" />,
  family: <Users className="w-4 h-4" />,
  cultural: <Globe className="w-4 h-4" />,
  health: <Heart className="w-4 h-4" />,
};

const categoryColors = {
  budget: "bg-green-100 text-green-800",
  family: "bg-blue-100 text-blue-800",
  cultural: "bg-purple-100 text-purple-800",
  health: "bg-red-100 text-red-800",
};

export default function Communities() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [forceCreatorMode, setForceCreatorMode] = useState(false);

  // Override creator status for testing
  const isCreator = user?.is_creator || forceCreatorMode;

  // Fetch communities
  const { data: communities = [], isLoading: loadingCommunities } = useQuery({
    queryKey: ["/api/communities", selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append("category", selectedCategory);
      const response = await fetch(`/api/communities?${params}`);
      if (!response.ok) throw new Error("Failed to fetch communities");
      return response.json();
    },
  });

  // Fetch trending meal plans
  const { data: trendingPlans = [] } = useQuery({
    queryKey: ["/api/trending-meal-plans"],
    queryFn: async () => {
      const response = await fetch("/api/trending-meal-plans?limit=6");
      if (!response.ok) throw new Error("Failed to fetch trending plans");
      return response.json();
    },
  });

  // Fetch top creators
  const { data: topCreators = [] } = useQuery({
    queryKey: ["/api/creators/top"],
    queryFn: async () => {
      const response = await fetch("/api/creators/top?metric=followers&limit=5");
      if (!response.ok) throw new Error("Failed to fetch top creators");
      return response.json();
    },
  });

  // Join community mutation
  const joinCommunity = useMutation({
    mutationFn: async (communityId: number) => {
      const response = await fetch(`/api/communities/${communityId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to join community");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/communities"] });
      toast({
        title: "Success",
        description: "You've joined the community!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter communities based on search
  const filteredCommunities = communities.filter((community: Community) =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                Communities
              </h1>
              <p className="text-gray-600 text-lg">
                Join communities to discover and share amazing meal plans with creators and food enthusiasts
              </p>
            </div>
            {/* Creator Mode Toggle for Testing */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
              <span className="text-sm text-gray-600">Creator Mode</span>
              <Button
                variant={forceCreatorMode ? "default" : "outline"}
                size="sm"
                onClick={() => setForceCreatorMode(!forceCreatorMode)}
              >
                {forceCreatorMode ? "ON" : "OFF"}
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <div 
              className="flex gap-2 overflow-x-auto scrollbar-hide"
              style={{ 
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitScrollbar: 'none'
              }}
            >
              <Button
                variant={!selectedCategory ? "default" : "outline"}
                onClick={() => setSelectedCategory(undefined)}
                size="sm"
                className="flex-shrink-0"
              >
                All
              </Button>
              {Object.keys(categoryIcons).map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  size="sm"
                  className="flex-shrink-0"
                >
                  {categoryIcons[category as keyof typeof categoryIcons]}
                  <span className="ml-1 capitalize">{category}</span>
                </Button>
              ))}
            </div>
            {/* Fade gradient hints for scrollable content */}
            <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-white via-white to-transparent pointer-events-none opacity-70"></div>
          </div>
        </div>

        <Tabs defaultValue="communities" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="communities">Communities</TabsTrigger>
            <TabsTrigger value="trending">Trending Plans</TabsTrigger>
            <TabsTrigger value="creators">Top Creators</TabsTrigger>
          </TabsList>

          {/* Communities Tab */}
          <TabsContent value="communities" className="space-y-6">
            {loadingCommunities ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading communities...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCommunities.map((community: Community) => (
                  <Card key={community.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <Link href={`/community/${community.id}`}>
                      {community.cover_image && (
                        <div className="h-32 bg-gradient-to-br from-purple-400 to-emerald-400 rounded-t-lg" />
                      )}
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{community.name}</CardTitle>
                            <Badge 
                              className={`mt-1 ${categoryColors[community.category as keyof typeof categoryColors] || "bg-gray-100 text-gray-800"}`}
                            >
                              {categoryIcons[community.category as keyof typeof categoryIcons]}
                              <span className="ml-1 capitalize">{community.category}</span>
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">{community.member_count} members</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="line-clamp-2 mb-4">
                          {community.description}
                        </CardDescription>
                        {isAuthenticated && (
                          <Button
                            variant={community.isMember ? "outline" : "default"}
                            size="sm"
                            className="w-full"
                            onClick={(e) => {
                              e.preventDefault();
                              if (!community.isMember) {
                                joinCommunity.mutate(community.id);
                              }
                            }}
                            disabled={community.isMember}
                          >
                            {community.isMember ? "Joined" : "Join Community"}
                          </Button>
                        )}
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            )}

            {/* Create Community Button - Only for Creators */}
            {isAuthenticated && isCreator && (
              <div className="mt-8 text-center">
                <Card className="inline-block p-6">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-emerald-500 rounded-full">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold">Create Your Own Community</h3>
                    <p className="text-gray-600 max-w-xs">
                      Start sharing your meal plans and build a following
                    </p>
                    <Button>Create Community</Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Become a Creator CTA - For non-creators */}
            {isAuthenticated && !isCreator && (
              <div className="mt-8 text-center">
                <Card className="inline-block p-6 border-dashed border-2 border-purple-300 bg-purple-50/50">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="p-3 bg-gradient-to-br from-purple-400 to-emerald-400 rounded-full opacity-60">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700">Want to Create Communities?</h3>
                    <p className="text-gray-600 max-w-xs">
                      Become a creator to share your meal plans and build your own community
                    </p>
                    <Badge className="bg-purple-100 text-purple-700">
                      Creator Mode Required
                    </Badge>
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Trending Plans Tab */}
          <TabsContent value="trending" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingPlans.map((plan: SharedMealPlan) => (
                <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                  <div className="aspect-video relative bg-gray-100 rounded-t-lg overflow-hidden">
                    {plan.preview_images && plan.preview_images[0] ? (
                      <img 
                        src={plan.preview_images[0]} 
                        alt={plan.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ChefHat className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-white/90 text-gray-800">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Trending
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-1">{plan.title}</CardTitle>
                    {plan.creator && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-emerald-500" />
                        <span className="text-sm text-gray-600">{plan.creator.name}</span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>${plan.metrics.cost_per_serving}/serving</span>
                      <span>{plan.metrics.total_prep_time} min</span>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4 text-red-500" />
                        {plan.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-blue-500" />
                        {plan.tries} tried
                      </span>
                      {plan.success_rate && (
                        <span className="text-green-600 font-semibold">
                          {plan.success_rate}% success
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Top Creators Tab */}
          <TabsContent value="creators" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topCreators.map((creator: Creator, index: number) => (
                <Card key={creator.user.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                            {creator.user.name.charAt(0).toUpperCase()}
                          </div>
                          {index < 3 && (
                            <Badge className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs">
                              #{index + 1}
                            </Badge>
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{creator.user.name}</CardTitle>
                          {creator.profile.verified_nutritionist && (
                            <Badge variant="secondary" className="mt-1">
                              Verified Nutritionist
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {creator.profile.bio && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {creator.profile.bio}
                      </p>
                    )}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-2xl font-bold text-purple-600">
                          {creator.profile.follower_count}
                        </p>
                        <p className="text-xs text-gray-500">Followers</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-emerald-600">
                          {creator.profile.total_plans_shared}
                        </p>
                        <p className="text-xs text-gray-500">Plans</p>
                      </div>
                      {creator.profile.average_rating && (
                        <div>
                          <p className="text-2xl font-bold text-yellow-600">
                            {creator.profile.average_rating}
                          </p>
                          <p className="text-xs text-gray-500">Rating</p>
                        </div>
                      )}
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}