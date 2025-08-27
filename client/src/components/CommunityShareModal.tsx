import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronRight, Upload, X, Send } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Recipe {
  id?: number;
  title: string;
  description?: string;
  ingredients?: string[];
  instructions?: string[];
  image_url?: string;
  time_minutes?: number;
  cuisine?: string;
  nutrition?: any;
  nutrition_info?: any;
}

interface MealPlan {
  id: number;
  name: string;
  description: string;
  meal_plan: any;
}

interface Community {
  id: number;
  name: string;
  description: string;
  member_count: number;
  cover_image?: string;
}

interface CommunityShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe?: Recipe;
  mealPlan?: MealPlan;
  shareType: "recipe" | "meal_plan";
}

export function CommunityShareModal({ 
  isOpen, 
  onClose, 
  recipe, 
  mealPlan, 
  shareType 
}: CommunityShareModalProps) {
  const [selectedCommunityId, setSelectedCommunityId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's communities
  const { data: communities = [] } = useQuery<Community[]>({
    queryKey: ['/api/communities/my-communities'],
    enabled: isOpen,
  });

  // Share to community mutation
  const shareMutation = useMutation({
    mutationFn: async (data: {
      community_id: number;
      content: string;
      post_type: string;
      recipe_data?: Recipe;
      meal_plan_id?: number;
      images?: string[];
    }) => {
      return await apiRequest('/api/community-posts', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Shared successfully!",
        description: `Your ${shareType === 'recipe' ? 'recipe' : 'meal plan'} has been shared with the community.`,
      });
      
      // Reset form
      setSelectedCommunityId(null);
      setMessage("");
      setSelectedImage(null);
      setImagePreview(null);
      setIsDetailsExpanded(false);
      onClose();
      
      // Invalidate community posts to refresh
      queryClient.invalidateQueries({ queryKey: ['/api/community-posts'] });
    },
    onError: (error) => {
      console.error('Share error:', error);
      toast({
        title: "Sharing failed",
        description: "Unable to share to community. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleShare = async () => {
    if (!selectedCommunityId) {
      toast({
        title: "Select a community",
        description: "Please choose a community to share with.",
        variant: "destructive",
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Add a message",
        description: "Please add a message to share with your recipe.",
        variant: "destructive",
      });
      return;
    }

    const shareData: any = {
      community_id: selectedCommunityId,
      content: message.trim(),
      post_type: shareType === 'recipe' ? 'meal_share' : 'meal_share',
    };

    if (shareType === 'recipe' && recipe) {
      shareData.recipe_data = recipe;
    } else if (shareType === 'meal_plan' && mealPlan) {
      shareData.meal_plan_id = mealPlan.id;
    }

    // Handle image upload if present
    if (selectedImage) {
      // For now, we'll store the image as base64 in the post
      // In a real app, you'd upload to object storage first
      shareData.images = [imagePreview];
    }

    shareMutation.mutate(shareData);
  };

  const itemToDisplay = shareType === 'recipe' ? recipe : mealPlan;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[85vw] max-w-xs sm:max-w-2xl h-fit max-h-[90vh] p-2 sm:p-6 mx-2">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-base sm:text-xl">Share to Community</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 sm:space-y-4">
          {/* Community Selection */}
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">Choose Community</label>
            <div className="space-y-1 sm:space-y-2">
              {communities.length === 0 ? (
                <p className="text-gray-500 text-sm">You're not a member of any communities yet.</p>
              ) : (
                communities.map((community) => (
                  <Card
                    key={community.id}
                    className={`p-1.5 sm:p-3 cursor-pointer transition-colors ${
                      selectedCommunityId === community.id
                        ? 'ring-1 ring-purple-500 bg-purple-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedCommunityId(community.id)}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-3">
                      {community.cover_image && (
                        <img 
                          src={community.cover_image} 
                          alt={community.name}
                          className="w-6 h-6 sm:w-10 sm:h-10 rounded object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-xs sm:text-base truncate">{community.name}</h3>
                        <p className="text-xs text-gray-600 truncate">{community.description}</p>
                        <p className="text-xs text-gray-400">{community.member_count} members</p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Message Input */}
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">Your Message</label>
            <Textarea
              placeholder={`Share your thoughts about this ${shareType === 'recipe' ? 'recipe' : 'meal plan'}...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="h-12 sm:min-h-[100px] text-xs sm:text-sm resize-none"
              rows={2}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">Add Image (Optional)</label>
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-16 sm:h-32 object-cover rounded"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute top-1 right-1 bg-white/90 hover:bg-white p-1 h-6 w-6"
                  onClick={handleRemoveImage}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="border border-dashed border-gray-300 rounded p-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label 
                  htmlFor="image-upload" 
                  className="cursor-pointer flex items-center justify-center gap-1 text-gray-500"
                >
                  <Upload className="h-4 w-4" />
                  <span className="text-xs">Upload image</span>
                </label>
              </div>
            )}
          </div>

          {/* Recipe/Meal Plan Details (Always collapsed on mobile) */}
          {itemToDisplay && (
            <div>
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-between p-1.5 sm:p-3 h-auto"
                onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
              >
                <span className="font-medium text-xs sm:text-base">
                  {shareType === 'recipe' ? 'Recipe' : 'Meal Plan'} Details
                </span>
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2 sm:pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 order-2 sm:order-1">
              Cancel
            </Button>
            <Button 
              onClick={handleShare} 
              disabled={shareMutation.isPending || !selectedCommunityId || !message.trim()}
              className="flex-1 bg-purple-600 hover:bg-purple-700 order-1 sm:order-2"
            >
              {shareMutation.isPending ? (
                "Sharing..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Share
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}