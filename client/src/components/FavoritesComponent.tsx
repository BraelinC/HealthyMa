import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Search, 
  Clock, 
  ChefHat, 
  Trash2, 
  Play,
  HeartOff,
  X,
  ShoppingCart,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ReactPlayer from "react-player";

interface FavoriteItem {
  id: number;
  item_type: "recipe" | "meal_plan" | "youtube_video";
  item_id: string;
  title: string;
  description?: string;
  image_url?: string;
  time_minutes?: number;
  cuisine?: string;
  diet?: string;
  video_id?: string;
  video_title?: string;
  video_channel?: string;
  metadata?: any;
  created_at: string;
}

export function FavoritesComponent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [expandedFavorite, setExpandedFavorite] = useState<FavoriteItem | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch favorites with instant loading - NO loading states
  const { data: favorites = [], error } = useQuery<FavoriteItem[]>({
    queryKey: ['/api/favorites'],
    enabled: true,
    staleTime: Infinity, // Never consider data stale - instant from cache
    gcTime: Infinity, // Keep in cache forever
    retry: 0, // No retries for instant response
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch when component mounts if data exists
    refetchOnReconnect: false // Don't refetch on reconnect
  });

  // Remove from favorites mutation
  const removeFromFavoritesMutation = useMutation({
    mutationFn: async (favorite: FavoriteItem) => {
      return apiRequest(`/api/favorites/${favorite.item_type}/${favorite.item_id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Removed from favorites",
        description: "Item successfully removed from your favorites"
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove item from favorites"
      });
    }
  });

  // Filter favorites based on search and selected filter
  const filteredFavorites = favorites.filter((favorite) => {
    const matchesSearch = favorite.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (favorite.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === "all" || favorite.item_type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  // Group favorites by type
  const favoritesByType = favorites.reduce((acc, favorite) => {
    if (!acc[favorite.item_type]) {
      acc[favorite.item_type] = [];
    }
    acc[favorite.item_type].push(favorite);
    return acc;
  }, {} as Record<string, FavoriteItem[]>);

  // Ensure all categories exist
  favoritesByType.recipe = favoritesByType.recipe || [];
  favoritesByType.meal_plan = favoritesByType.meal_plan || [];
  favoritesByType.youtube_video = favoritesByType.youtube_video || [];

  const FavoriteCard = ({ favorite }: { favorite: FavoriteItem }) => {
    const isExpanded = expandedFavorite?.id === favorite.id;

    const handleToggleExpand = () => {
      setExpandedFavorite(isExpanded ? null : favorite);
    };

    const handleRemove = () => {
      removeFromFavoritesMutation.mutate(favorite);
    };

    const getTypeIcon = (type: string) => {
      switch (type) {
        case "recipe": return <ChefHat className="h-4 w-4" />;
        case "meal_plan": return <Heart className="h-4 w-4" />;
        case "youtube_video": return <Play className="h-4 w-4" />;
        default: return <Heart className="h-4 w-4" />;
      }
    };

    const getTypeColor = (type: string) => {
      switch (type) {
        case "recipe": return "bg-orange-100 text-orange-800";
        case "meal_plan": return "bg-purple-100 text-purple-800";
        case "youtube_video": return "bg-red-100 text-red-800";
        default: return "bg-gray-100 text-gray-800";
      }
    };

    return (
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-200">
        <CardContent className="p-0">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`${getTypeColor(favorite.item_type)} text-xs`}>
                    {getTypeIcon(favorite.item_type)}
                    <span className="ml-1 capitalize">{favorite.item_type.replace('_', ' ')}</span>
                  </Badge>
                  {favorite.time_minutes && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {favorite.time_minutes}m
                    </Badge>
                  )}
                </div>
                <h3 
                  className="font-semibold text-lg text-gray-900 mb-2 cursor-pointer hover:text-purple-600 transition-colors"
                  onClick={handleToggleExpand}
                >
                  {favorite.title}
                </h3>
                {favorite.description && (
                  <p className="text-gray-600 text-sm mb-3">{favorite.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleExpand}
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                >
                  {isExpanded ? "Hide" : "View"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemove}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t pt-4 mt-4">
                {favorite.item_type === "youtube_video" && favorite.video_id ? (
                  <div className="space-y-4">
                    <div className="aspect-video">
                      <ReactPlayer
                        url={`https://www.youtube.com/watch?v=${favorite.video_id}`}
                        width="100%"
                        height="100%"
                        controls
                      />
                    </div>
                    {favorite.video_channel && (
                      <p className="text-sm text-gray-600">
                        Channel: {favorite.video_channel}
                      </p>
                    )}
                  </div>
                ) : favorite.metadata ? (
                  <div className="space-y-4">
                    {favorite.metadata.ingredients && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Ingredients:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {favorite.metadata.ingredients.map((ingredient: string, index: number) => (
                            <li key={index}>{ingredient}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {favorite.metadata.instructions && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Instructions:</h4>
                        <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                          {favorite.metadata.instructions.map((instruction: string, index: number) => (
                            <li key={index}>{instruction}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                    {favorite.metadata.nutrition_info && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Nutrition:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-medium text-gray-900">{favorite.metadata.nutrition_info.calories}</div>
                            <div className="text-gray-600">Calories</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-gray-900">{favorite.metadata.nutrition_info.protein_g}g</div>
                            <div className="text-gray-600">Protein</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-gray-900">{favorite.metadata.nutrition_info.carbs_g}g</div>
                            <div className="text-gray-600">Carbs</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-gray-900">{favorite.metadata.nutrition_info.fat_g}g</div>
                            <div className="text-gray-600">Fat</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No additional details available.</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const EmptyState = ({ type }: { type: string }) => (
    <div className="text-center py-12">
      <HeartOff className="h-12 w-12 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-600 mb-2">
        No {type === "all" ? "favorites" : type.replace("_", " ")} found
      </h3>
      <p className="text-gray-500 text-sm max-w-md mx-auto">
        {searchQuery 
          ? `No ${type === "all" ? "favorites" : type.replace("_", " ")} match your search.`
          : `Start adding ${type === "all" ? "items" : type.replace("_", " ")} to your favorites to see them here!`
        }
      </p>
    </div>
  );

  // NO LOADING STATE - Always show content immediately

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <AlertCircle className="w-12 h-12 mx-auto mb-2" />
          Failed to load favorites
        </div>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/favorites'] })}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Heart className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
        </div>
        <p className="text-gray-600">
          Your saved recipes, meal plans, and cooking videos in one place
        </p>
      </div>

      {/* Search and Stats */}
      <div className="mb-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search your favorites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {favorites.length > 0 && (
          <div className="text-sm text-gray-600">
            {filteredFavorites.length} of {favorites.length} favorites
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        )}
      </div>

      {/* Content */}
      {favorites.length === 0 ? (
        <EmptyState type="all" />
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="all">
              All ({favorites.length})
            </TabsTrigger>
            <TabsTrigger value="recipe">
              Recipes ({favoritesByType.recipe.length})
            </TabsTrigger>
            <TabsTrigger value="meal_plan">
              Meal Plans ({favoritesByType.meal_plan.length})
            </TabsTrigger>
            <TabsTrigger value="youtube_video">
              Videos ({favoritesByType.youtube_video.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {filteredFavorites.length > 0 ? (
              <div className="space-y-4">
                {filteredFavorites.map((favorite: FavoriteItem) => (
                  <FavoriteCard key={favorite.id} favorite={favorite} />
                ))}
              </div>
            ) : (
              <EmptyState type="all" />
            )}
          </TabsContent>

          <TabsContent value="recipe">
            {favoritesByType.recipe.filter(f => 
              f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (f.description || "").toLowerCase().includes(searchQuery.toLowerCase())
            ).length > 0 ? (
              <div className="space-y-4">
                {favoritesByType.recipe
                  .filter(f => 
                    f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (f.description || "").toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((favorite: FavoriteItem) => (
                    <FavoriteCard key={favorite.id} favorite={favorite} />
                  ))}
              </div>
            ) : (
              <EmptyState type="recipe" />
            )}
          </TabsContent>

          <TabsContent value="meal_plan">
            {favoritesByType.meal_plan.filter(f => 
              f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (f.description || "").toLowerCase().includes(searchQuery.toLowerCase())
            ).length > 0 ? (
              <div className="space-y-4">
                {favoritesByType.meal_plan
                  .filter(f => 
                    f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (f.description || "").toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((favorite: FavoriteItem) => (
                    <FavoriteCard key={favorite.id} favorite={favorite} />
                  ))}
              </div>
            ) : (
              <EmptyState type="meal_plan" />
            )}
          </TabsContent>

          <TabsContent value="youtube_video">
            {favoritesByType.youtube_video.filter(f => 
              f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (f.description || "").toLowerCase().includes(searchQuery.toLowerCase())
            ).length > 0 ? (
              <div className="space-y-4">
                {favoritesByType.youtube_video
                  .filter(f => 
                    f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (f.description || "").toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((favorite: FavoriteItem) => (
                    <FavoriteCard key={favorite.id} favorite={favorite} />
                  ))}
              </div>
            ) : (
              <EmptyState type="youtube_video" />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}