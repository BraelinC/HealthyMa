import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ReactPlayer from "react-player/youtube";
import { formatYouTubeEmbedUrl, formatYouTubeThumbnailUrl } from "@/lib/youtubeUtils";
import { enhanceRecipeWithVideo } from "@/lib/api";
import { 
  ShoppingCart, 
  RefreshCw, 
  Clock, 
  ChefHat, 
  ShoppingBag,
  Share,
  Bookmark,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Star,
  ListPlus,
  Check,
  X,
  Maximize,
  Youtube
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface Ingredient {
  name: string;
  display_text: string;
  measurements: {
    quantity: number;
    unit: string;
  }[];
}

interface Recipe {
  id?: string | number;
  title: string;
  description?: string;
  image_url: string;
  time_minutes?: number;
  cuisine?: string;
  diet?: string;
  ingredients: Ingredient[];
  instructions: string[];
  nutrition_info?: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
    sodium_mg: number;
  };
  is_saved?: boolean;
  source_url?: string;
  source_name?: string;
  video_id?: string;
  video_title?: string;
  video_channel?: string;
  transcript_ingredients?: string[];
}

interface RecipeDisplayProps {
  recipe: Recipe;
  onRegenerateClick?: () => void;
}

const RecipeDisplay = ({ recipe, onRegenerateClick }: RecipeDisplayProps) => {
  const { toast } = useToast();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isPlayingInApp, setIsPlayingInApp] = useState(false);
  const [hasIngredients, setHasIngredients] = useState<Record<string, boolean>>({});
  const [isSaved, setIsSaved] = useState(recipe.is_saved || false);
  const [imgError, setImgError] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [recipeSource, setRecipeSource] = useState<{
    name: string;
    url: string;
  } | null>(null);
  const [showTranscriptIngredients, setShowTranscriptIngredients] = useState(false);
  const [transcriptIngredients, setTranscriptIngredients] = useState<string[]>([]);
  const [videoDetails, setVideoDetails] = useState<{
    title: string;
    channelTitle: string;
  } | null>(null);

  // Use recipe data directly without additional API calls
  const enhancedRecipe = recipe;

  // Extract YouTube data and set UI state when enhanced data is available
  useEffect(() => {
    if (enhancedRecipe) {
      // Set video ID
      if (enhancedRecipe.video_id) {
        setVideoId(enhancedRecipe.video_id);
      }

      // Set video details
      if (enhancedRecipe.video_title && enhancedRecipe.video_channel) {
        setVideoDetails({
          title: enhancedRecipe.video_title,
          channelTitle: enhancedRecipe.video_channel
        });
      }

      // Set transcript ingredients
      if (enhancedRecipe.transcript_ingredients && enhancedRecipe.transcript_ingredients.length > 0) {
        setTranscriptIngredients(enhancedRecipe.transcript_ingredients);
      }

      // Set recipe source if available
      if (enhancedRecipe.source_url && enhancedRecipe.source_name) {
        setRecipeSource({
          name: enhancedRecipe.source_name,
          url: enhancedRecipe.source_url
        });
      }
    }
  }, [enhancedRecipe]);

  // Look for recipe source as fallback
  useEffect(() => {
    const fetchSourceInfo = async () => {
      // If recipe already has source information, use that
      if (recipe.source_url && recipe.source_name) {
        setRecipeSource({
          name: recipe.source_name,
          url: recipe.source_url
        });
        return;
      }

      // Skip if we already set source from enhanced recipe
      if (recipeSource) return;

      // Recipe source detection removed - using backend data only
      console.log("Recipe source detection disabled");
    };

    // Initialize recipe ingredients
    const initIngredients = () => {
      const ingredientMap: Record<string, boolean> = {};
      recipe.ingredients.forEach((ingredient, index) => {
        ingredientMap[`ingredient-${index}`] = false;
      });
      setHasIngredients(ingredientMap);
    };

    fetchSourceInfo();
    initIngredients();
  }, [recipe, recipeSource]);

  // Use stored video data from recipe or fetch manually if needed
  const fetchVideoManually = async () => {
    if (videoId) return; // Skip if we already have a video

    // First check if recipe has stored video data
    if (recipe.video_id) {
      console.log("Using stored video from recipe:", recipe.video_title);
      setVideoId(recipe.video_id);
      setVideoDetails({
        title: recipe.video_title || 'Video',
        channelTitle: recipe.video_channel || 'Unknown Channel'
      });
      return;
    }

    // Fallback to search if no stored video data
    setIsVideoLoading(true);
    try {
      // Video search disabled - using backend-generated video data only
      console.log("Video search disabled - backend data should include video info");
    } catch (error) {
      console.error("Error fetching video:", error);
    } finally {
      setIsVideoLoading(false);
    }
  };

  // Toggle ingredient checked state
  const toggleIngredient = (id: string) => {
    setHasIngredients(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Add transcript ingredient to recipe
  const addTranscriptIngredient = async (ingredient: string) => {
    if (!recipe.id) {
      toast({
        title: "Cannot add ingredient",
        description: "Recipe ID is missing",
        variant: "destructive",
      });
      return;
    }

    try {
      // This functionality would need to be implemented on the backend
      toast({
        title: "Feature not available",
        description: "Adding transcript ingredients is not yet implemented",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error adding ingredient",
        description: "Failed to add ingredient to recipe",
        variant: "destructive",
      });
    }
  };

  // Instacart integration
  const shopRecipeWithInstacart = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/recipes/instacart", recipe);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      setIsAddingToCart(false);

      if (data.products_link_url) {
        window.open(data.products_link_url, '_blank');
      } else {
        toast({
          title: "Success!",
          description: "The recipe has been added to your Instacart cart.",
        });
      }
    },
    onError: (error) => {
      setIsAddingToCart(false);
      toast({
        title: "Error",
        description: `Failed to add to Instacart: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Save/unsave recipe functionality
  const saveRecipeMutation = useMutation({
    mutationFn: async () => {
      if (!recipe.id) throw new Error("Recipe ID is required");

      const { safeApiRequest } = await import("@/lib/queryClient");

      if (isSaved) {
        // Unsave the recipe
        return await safeApiRequest(`/api/recipes/${recipe.id}/save`, {
          method: "DELETE"
        });
      } else {
        // Save the recipe
        return await safeApiRequest(`/api/recipes/${recipe.id}/save`, {
          method: "POST"
        });
      }
    },
    onSuccess: () => {
      setIsSaved(!isSaved);
      toast({
        title: isSaved ? "Recipe unsaved" : "Recipe saved",
        description: isSaved ? "Removed from your saved recipes" : "Added to your saved recipes",
      });
    },
    onError: (error) => {
      console.error("Save/unsave error:", error);
      toast({
        title: "Error",
        description: `Failed to ${isSaved ? 'unsave' : 'save'} recipe: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleToggleSave = () => {
    saveRecipeMutation.mutate();
  };

  // Generate a fallback image based on recipe title
  const getFallbackImage = () => {
    const recipeName = recipe.title ? encodeURIComponent(recipe.title.toLowerCase().replace(/[^a-z0-9\s]/g, '')) : 'recipe';
    return `https://source.unsplash.com/1200x900/?food,${recipeName},cooking,delicious`;
  };

  const handleShopIngredients = () => {
    setIsAddingToCart(true);
    shopRecipeWithInstacart.mutate();
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md">
      {/* Recipe Image Section */}
      <div className="relative">
        {(
          <div className="relative">
            <img 
              src={imgError ? getFallbackImage() : (recipe.image_url || getFallbackImage())} 
              alt={recipe.title} 
              className="w-full h-48 object-cover" 
              onError={() => setImgError(true)}
            />

            {/* Video thumbnail and playback controls */}
            {videoId && !isPlayingInApp && (
              <div 
                className="absolute inset-0 cursor-pointer"
                onClick={() => setIsPlayingInApp(true)}
              >
                {/* Video thumbnail with play button overlay */}
                <img 
                  src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
                  alt={recipe.title + " video thumbnail"} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center shadow-lg mb-2">
                    <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[16px] border-l-primary border-b-[10px] border-b-transparent ml-1"></div>
                  </div>
                  <span className="text-white text-sm font-medium">Play Video</span>
                </div>

                {/* YouTube branding */}
                <div className="absolute bottom-3 left-3 flex items-center bg-black/70 text-white px-2 py-1 rounded-md">
                  <Youtube className="h-4 w-4 mr-1 text-red-500" />
                  <span className="text-xs">Play in App</span>
                </div>

                {/* Alternative option to open on YouTube */}
                <a 
                  href={`https://www.youtube.com/watch?v=${videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 text-xs rounded-md flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Watch on YouTube
                </a>
              </div>
            )}

            {/* In-app video player */}
            {videoId && isPlayingInApp && (
              <div 
                ref={videoContainerRef}
                className="relative w-full aspect-video"
              >
                <ReactPlayer
                  url={`https://www.youtube.com/watch?v=${videoId}`}
                  width="100%"
                  height="100%"
                  controls={true}
                  playing={true}
                />

                {/* Close button */}
                <button
                  onClick={() => setIsPlayingInApp(false)}
                  className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1 z-10"
                  aria-label="Close video player"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Recipe time */}
            {recipe.time_minutes && (
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md flex items-center">
                <Clock className="h-3 w-3 mr-1" /> 
                {recipe.time_minutes} min
              </div>
            )}
          </div>
        )}

        {videoDetails && (
          <div className="bg-gray-50 px-3 py-2 text-xs">
            <a 
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <div className="font-medium text-gray-900 truncate hover:text-primary">{videoDetails.title}</div>
              <div className="text-gray-500">by {videoDetails.channelTitle}</div>
            </a>
          </div>
        )}

        {/* Quick action buttons */}
        <div className="absolute top-2 right-2 flex gap-2">
          <Button 
            variant="secondary" 
            size="icon" 
            className="bg-white/90 text-gray-700 w-8 h-8 rounded-full shadow-sm"
          >
            <Share className="h-4 w-4" />
          </Button>
          <Button 
            variant="secondary" 
            size="icon" 
            onClick={handleToggleSave}
            disabled={saveRecipeMutation.isPending}
            className={`w-8 h-8 rounded-full shadow-sm ${
              isSaved 
                ? 'bg-yellow-500 text-white' 
                : 'bg-white/90 text-gray-700'
            }`}
          >
            <Star className={`h-4 w-4 ${isSaved ? 'fill-white' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Recipe Header */}
      <div className="p-4">
        <h2 className="text-lg font-bold">{recipe.title}</h2>

        {/* Recipe source & rating */}
        {recipeSource && (
          <div className="flex items-center mt-1 mb-2">
            <span className="text-xs text-gray-600">from </span>
            <a 
              href={recipeSource.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-primary font-medium ml-1 flex items-center"
            >
              {recipeSource.name}
              <ExternalLink className="h-3 w-3 ml-0.5" />
            </a>
            <div className="mx-2 flex items-center">
              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 opacity-50" />
            </div>
          </div>
        )}

        {/* Recipe tags */}
        <div className="flex flex-wrap gap-1.5 my-2">
          {recipe.cuisine && (
            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
              {recipe.cuisine}
            </span>
          )}

          {recipe.diet && recipe.diet !== "None" && (
            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
              {recipe.diet}
            </span>
          )}
        </div>

        {/* Description toggle */}
        {recipe.description && (
          <div className="mt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowDescription(!showDescription)}
              className="flex w-full items-center justify-between p-0 h-7 text-gray-500 text-xs hover:text-gray-700"
            >
              <span>Description</span>
              {showDescription ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </Button>

            {showDescription && (
              <p className="text-gray-600 text-sm mt-1 mb-2">{recipe.description}</p>
            )}
          </div>
        )}

        {/* Action Buttons - Only Regenerate */}
        <div className="flex gap-2 mt-3 mb-1">
          {onRegenerateClick && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1.5 text-xs h-9"
              onClick={onRegenerateClick}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              New Recipe
            </Button>
          )}
        </div>

        {/* View full recipe button */}
        {recipeSource && (
          <a
            href={recipeSource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center text-sm text-primary mt-2 underline"
          >
            View Full Recipe
          </a>
        )}
      </div>



      {/* Tabs for Ingredients, Instructions, and Nutrition */}
      <Tabs defaultValue="ingredients" className="w-full">
        <TabsList className="w-full grid grid-cols-3 h-10 bg-gray-100 rounded-none">
          <TabsTrigger value="ingredients" className="text-xs">Ingredients</TabsTrigger>
          <TabsTrigger value="instructions" className="text-xs">Instructions</TabsTrigger>
          <TabsTrigger value="nutrition" className="text-xs">Nutrition</TabsTrigger>
        </TabsList>

        <TabsContent value="ingredients" className="p-4 pt-3">
          {/* Display structured ingredients with measurements */}
          <ul className="space-y-2">
            {recipe.ingredients && recipe.ingredients.length > 0 ? recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Checkbox 
                  id={`ingredient-${index}`} 
                  className="mt-0.5" 
                  checked={hasIngredients[`ingredient-${index}`] || false}
                  onCheckedChange={() => toggleIngredient(`ingredient-${index}`)}
                />
                <label 
                  htmlFor={`ingredient-${index}`} 
                  className={`cursor-pointer ${hasIngredients[`ingredient-${index}`] ? 'text-gray-400 line-through' : 'text-gray-700'}`}
                >
                  {(() => {
                    const displayText = ingredient.display_text || ingredient.name;

                    // Check if this is a "to taste" ingredient (salt, pepper, etc.)
                    const isToTaste = displayText?.toLowerCase().includes('to taste') || 
                                     displayText?.toLowerCase().includes('salt') || 
                                     displayText?.toLowerCase().includes('pepper') ||
                                     ingredient.measurements?.[0]?.unit === 'to taste';

                    if (isToTaste) {
                      // For "to taste" ingredients, just show the name without measurements
                      // Remove fractions, decimals, and units at the beginning
                      return displayText
                        .replace(/^[\d\/\.\s]*(teaspoon|tsp|tablespoon|tbsp|cup|pinch|dash)s?\s*/i, '')
                        .replace(/^[\d\/\.\s]+/, '') // Remove any remaining numbers/fractions
                        .trim();
                    }

                    // Check if display_text already contains measurements (like "1.5 lbs large shrimp")
                    const hasNumberInText = /^\d+/.test(displayText);

                    if (hasNumberInText) {
                      // Display text already has measurements, use as-is
                      return displayText;
                    } else if (ingredient.measurements?.[0]?.quantity && ingredient.measurements?.[0]?.unit) {
                      // No measurements in text, add them from structured data
                      return `${ingredient.measurements[0].quantity} ${ingredient.measurements[0].unit} ${displayText}`;
                    } else {
                      // No measurements available
                      return displayText;
                    }
                  })()}
                </label>
              </li>
            )) : (
              <li className="text-gray-500 text-sm">No ingredients available</li>
            )}
          </ul>

          {/* Shop Button underneath ingredients */}
          <div className="mt-4">
            <Button
              size="sm"
              className="w-full text-white gap-1.5 text-xs h-9"
              onClick={handleShopIngredients}
              disabled={isAddingToCart}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              {isAddingToCart ? "Adding..." : "Shop"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="instructions" className="p-4 pt-3">
          <ol className="space-y-3">
            {recipe.instructions && recipe.instructions.length > 0 ? recipe.instructions.map((instruction, index) => (
              <li key={index} className="flex gap-2 text-sm">
                <span className="flex-shrink-0 w-5 h-5 bg-primary rounded-full text-white flex items-center justify-center text-xs">
                  {index + 1}
                </span>
                <span className="text-gray-700">{instruction}</span>
              </li>
            )) : (
              <li className="text-gray-500 text-sm">No instructions available</li>
            )}
          </ol>
        </TabsContent>

        <TabsContent value="nutrition" className="p-4 pt-3">
          {recipe.nutrition_info ? (
            <div>
              <h4 className="font-semibold mb-4 text-purple-700">USDA Nutrition Analysis</h4>

              {/* Main Macros - 3 prominent boxes */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-700">{recipe.nutrition_info.calories}</div>
                  <div className="text-sm font-medium text-purple-600">Calories</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-700">{recipe.nutrition_info.protein_g}g</div>
                  <div className="text-sm font-medium text-green-600">Protein</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-700">{recipe.nutrition_info.carbs_g}g</div>
                  <div className="text-sm font-medium text-blue-600">Carbs</div>
                </div>
              </div>

              {/* Secondary Macros - smaller boxes underneath */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-700">{recipe.nutrition_info.fat_g}g</div>
                  <div className="text-sm text-gray-500">Fat</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-700">{recipe.nutrition_info.fiber_g || 0}g</div>
                  <div className="text-sm text-gray-500">Fiber</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-700">{recipe.nutrition_info.sodium_mg || 0}mg</div>
                  <div className="text-sm text-gray-500">Sodium</div>
                </div>
              </div>

              <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded-lg">
                <strong>Data Source:</strong> Nutrition values calculated from USDA FoodData Central database using authentic ingredient data and standard serving sizes based on USDA dietary guidelines.
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500">Nutrition information not available for this recipe.</div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecipeDisplay;