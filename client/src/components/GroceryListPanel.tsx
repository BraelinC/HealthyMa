import { useState, useEffect } from "react";
import { 
  X, 
  ShoppingCart, 
  Loader2,
  Apple,
  Beef,
  Milk,
  Wheat,
  Fish,
  Egg,
  Carrot,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { safeApiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  category?: string;
  displayText?: string;
  notes?: string;
}

interface MealPlan {
  id: number;
  name: string;
  mealPlan: any;
}

interface GroceryListPanelProps {
  isOpen: boolean;
  onClose: () => void;
  mealPlan: MealPlan | null;
  prefetchedData?: any;
  onDataRefreshed?: (data: any) => void;
}

// Food category icons mapping
const categoryIcons: { [key: string]: JSX.Element } = {
  produce: <Apple className="w-4 h-4" />,
  meat: <Beef className="w-4 h-4" />,
  dairy: <Milk className="w-4 h-4" />,
  bakery: <Wheat className="w-4 h-4" />,
  seafood: <Fish className="w-4 h-4" />,
  eggs: <Egg className="w-4 h-4" />,
  vegetables: <Carrot className="w-4 h-4" />,
};

// Function to categorize ingredients
function categorizeIngredient(ingredient: string): string {
  const lowerIngredient = ingredient.toLowerCase();
  
  // Meat category
  if (lowerIngredient.includes('chicken') || lowerIngredient.includes('beef') || 
      lowerIngredient.includes('pork') || lowerIngredient.includes('turkey') ||
      lowerIngredient.includes('lamb') || lowerIngredient.includes('bacon') ||
      lowerIngredient.includes('sausage') || lowerIngredient.includes('ham')) {
    return 'meat';
  }
  
  // Seafood category
  if (lowerIngredient.includes('fish') || lowerIngredient.includes('salmon') ||
      lowerIngredient.includes('shrimp') || lowerIngredient.includes('crab') ||
      lowerIngredient.includes('lobster') || lowerIngredient.includes('tuna')) {
    return 'seafood';
  }
  
  // Dairy category
  if (lowerIngredient.includes('milk') || lowerIngredient.includes('cheese') ||
      lowerIngredient.includes('yogurt') || lowerIngredient.includes('butter') ||
      lowerIngredient.includes('cream') || lowerIngredient.includes('sour cream')) {
    return 'dairy';
  }
  
  // Eggs category
  if (lowerIngredient.includes('egg')) {
    return 'eggs';
  }
  
  // Bakery category
  if (lowerIngredient.includes('bread') || lowerIngredient.includes('tortilla') ||
      lowerIngredient.includes('roll') || lowerIngredient.includes('bagel') ||
      lowerIngredient.includes('muffin') || lowerIngredient.includes('croissant')) {
    return 'bakery';
  }
  
  // Vegetables and produce
  if (lowerIngredient.includes('tomato') || lowerIngredient.includes('lettuce') ||
      lowerIngredient.includes('onion') || lowerIngredient.includes('garlic') ||
      lowerIngredient.includes('carrot') || lowerIngredient.includes('celery') ||
      lowerIngredient.includes('pepper') || lowerIngredient.includes('spinach') ||
      lowerIngredient.includes('broccoli') || lowerIngredient.includes('potato') ||
      lowerIngredient.includes('mushroom') || lowerIngredient.includes('cucumber') ||
      lowerIngredient.includes('zucchini') || lowerIngredient.includes('corn') ||
      lowerIngredient.includes('apple') || lowerIngredient.includes('banana') ||
      lowerIngredient.includes('orange') || lowerIngredient.includes('lemon') ||
      lowerIngredient.includes('lime') || lowerIngredient.includes('avocado')) {
    return 'produce';
  }
  
  // Default category
  return 'pantry';
}

export function GroceryListPanel({ isOpen, onClose, mealPlan, prefetchedData, onDataRefreshed }: GroceryListPanelProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [categorizedIngredients, setCategorizedIngredients] = useState<{ [key: string]: Ingredient[] }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [savings, setSavings] = useState<{ duplicatesRemoved: number; itemsConsolidated: number } | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const { toast } = useToast();

  // Handle opening Instacart
  const handleOpenInstacart = async () => {
    // If we already have the URL from initial load, just open it
    if ((window as any).__instacartUrl) {
      window.open((window as any).__instacartUrl, '_blank');
      toast({
        title: "Shopping List Opened",
        description: "Your optimized Instacart shopping list has been opened!",
      });
      return;
    }
    
    // Otherwise, create a new shopping list
    createShoppingListMutation.mutate();
  };

  // Create shopping list mutation
  const createShoppingListMutation = useMutation({
    mutationFn: async () => {
      if (!mealPlan) throw new Error("No meal plan selected");
      
      return await safeApiRequest('/api/create-shopping-list', {
        method: 'POST',
        body: JSON.stringify({ mealPlanId: mealPlan.id }),
      });
    },
    onSuccess: (data) => {
      // Open Instacart if URL is available
      if (data.shoppingUrl) {
        window.open(data.shoppingUrl, '_blank');
        toast({
          title: "Shopping List Created",
          description: "Your optimized Instacart shopping list has been created!",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create shopping list. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update data when prefetchedData changes
  useEffect(() => {
    if (prefetchedData && prefetchedData.consolidatedIngredients) {
      console.log('Updating with prefetched grocery data');
      processGroceryData(prefetchedData);
      setIsLoading(false);
    }
  }, [prefetchedData]);
  
  // Fetch data if not prefetched when panel opens
  useEffect(() => {
    if (!mealPlan || !isOpen) return;
    
    // Only fetch if we don't have data already
    if (!ingredients.length && !prefetchedData) {
      const fetchConsolidatedList = async () => {
        setIsLoading(true);
        try {
          console.log('Fetching grocery list from API');
          // Get the consolidated ingredients from the API
          const response = await safeApiRequest('/api/create-shopping-list', {
            method: 'POST',
            body: JSON.stringify({ mealPlanId: mealPlan.id }),
          });
          
          processGroceryData(response);
          
          // Update the parent component with fresh data
          if (onDataRefreshed) {
            onDataRefreshed(response);
          }
        } catch (error) {
          console.error("Error fetching consolidated list:", error);
        }
        setIsLoading(false);
      };
      
      fetchConsolidatedList();
    }
  }, [mealPlan?.id, isOpen, ingredients.length]); // Check if we already have ingredients
  
  // Helper function to process grocery data
  const processGroceryData = (response: any) => {
    if (response.consolidatedIngredients) {
      const consolidatedIngredients: Ingredient[] = response.consolidatedIngredients.map((ing: any) => ({
        name: ing.name,
        displayText: ing.displayText || ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        category: ing.category || categorizeIngredient(ing.name),
        notes: ing.notes
      }));
      
      // Group by category
      const grouped = consolidatedIngredients.reduce((acc, ingredient) => {
        const category = ingredient.category || 'other';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(ingredient);
        return acc;
      }, {} as { [key: string]: Ingredient[] });
      
      setIngredients(consolidatedIngredients);
      setCategorizedIngredients(grouped);
      setSavings(response.savings);
      setRecommendations(response.recommendations || []);
      
      // Store the response for later use
      if (response.shoppingUrl) {
        (window as any).__instacartUrl = response.shoppingUrl;
      }
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Slide-over panel */}
      <div className={`fixed top-0 left-0 h-full w-full max-w-md bg-background shadow-xl z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold">Grocery List</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="relative h-[calc(100vh-140px)]">
          <ScrollArea className="h-full">
            <div className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                
                {/* Summary */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Smart Shopping Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total items:</span>
                      <span className="font-medium">{ingredients.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-muted-foreground">Categories:</span>
                      <span className="font-medium">{Object.keys(categorizedIngredients).length}</span>
                    </div>
                    {savings && (
                      <>
                        <div className="flex items-center justify-between text-sm mt-2">
                          <span className="text-muted-foreground">Duplicates removed:</span>
                          <span className="font-medium text-green-600">{savings.duplicatesRemoved}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-2">
                          <span className="text-muted-foreground">Items consolidated:</span>
                          <span className="font-medium text-green-600">{savings.itemsConsolidated}</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
                
                {/* Recommendations */}
                {recommendations.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Smart Shopping Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start">
                            <ChevronRight className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
                
                {/* Categorized ingredients */}
                {Object.entries(categorizedIngredients).map(([category, items]) => (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-3">
                      {categoryIcons[category] || <ShoppingCart className="w-4 h-4" />}
                      <h3 className="font-semibold capitalize">{category}</h3>
                      <Badge variant="secondary" className="ml-auto">
                        {items.length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {items.map((ingredient, index) => (
                        <div
                          key={`${category}-${index}`}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex-1">
                            <span className="text-sm font-medium">{ingredient.displayText || ingredient.name}</span>
                            {ingredient.notes && (
                              <span className="text-xs text-muted-foreground block mt-1">{ingredient.notes}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        
        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={handleOpenInstacart}
            disabled={createShoppingListMutation.isPending || ingredients.length === 0}
          >
            {createShoppingListMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Opening Instacart...
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in Instacart
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}