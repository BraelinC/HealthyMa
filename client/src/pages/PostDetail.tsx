import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  ArrowLeft, Pin, ThumbsUp, Share2, MoreHorizontal, Bell
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { CommentsSection } from "@/components/CommentsSection";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CommunityPost {
  id: number;
  user_id: string;
  username: string;
  user_avatar?: string;
  content: string;
  post_type: 'meal_share' | 'discussion' | 'question' | 'announcement';
  meal_plan_id?: number;
  meal_title?: string;
  meal_image?: string;
  images?: string[];
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  is_liked: boolean;
  created_at: string;
}

interface Community {
  id: number;
  name: string;
  description: string;
  creator_id: string;
  member_count: number;
  category: string;
  is_public: boolean;
  created_at: string;
  cover_image?: string;
}

export default function PostDetail() {
  const { communityId, postId } = useParams();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch community details
  const { data: community } = useQuery({
    queryKey: ["/api/communities", communityId],
    queryFn: () => apiRequest(`/api/communities/${communityId}`),
    enabled: !!communityId && isAuthenticated,
  });

  // Fetch specific post details
  const { data: post, isLoading } = useQuery({
    queryKey: [`/api/communities/${communityId}/posts`, postId],
    queryFn: async () => {
      const posts = await apiRequest(`/api/communities/${communityId}/posts`);
      return posts.find((p: CommunityPost) => p.id === parseInt(postId!));
    },
    enabled: !!communityId && !!postId && isAuthenticated,
  });

  const getPostTypeBadge = (type: string) => {
    const badges = {
      meal_share: <Badge className="bg-green-600 text-white">Meal Share</Badge>,
      discussion: <Badge className="bg-blue-600 text-white">Discussion</Badge>,
      question: <Badge className="bg-yellow-600 text-white">Question</Badge>,
      announcement: <Badge className="bg-purple-600 text-white">Announcement</Badge>,
    };
    return badges[type as keyof typeof badges] || badges.discussion;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  const handleBackNavigation = () => {
    setLocation(`/community/${communityId}`);
  };

  const likePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest(`/api/communities/${communityId}/posts/${postId}/like`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/communities/${communityId}/posts`] 
      });
    },
  });

  const handleLikePost = (postId: number) => {
    likePostMutation.mutate(postId);
  };

  if (isLoading || !post) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 z-[100] overflow-y-auto">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-[101]">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackNavigation}
              className="text-gray-400 hover:text-white p-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            {community && (
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8 bg-purple-600">
                  <AvatarFallback className="bg-purple-600 text-white text-sm">
                    {community.name[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-white font-medium">{community.name}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-gray-400 p-1">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 p-1">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Post Content */}
      <div className="p-4">
        <Card className="bg-gray-800 border-gray-700 mb-4">
          <CardContent className="p-4">
            {/* Post Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-blue-600 text-white">
                    {post.username[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-white">{post.username}</h3>
                    {getPostTypeBadge(post.post_type)}
                  </div>
                  <p className="text-sm text-gray-400">{formatDate(post.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {post.is_pinned && <Pin className="w-4 h-4 text-purple-400" />}
              </div>
            </div>

            {/* Post Title (for discussions/questions) */}
            {(post.post_type === 'discussion' || post.post_type === 'question') && (
              <h1 className="text-xl font-semibold text-white mb-4">
                {post.content.split('\n')[0]}
              </h1>
            )}

            {/* Post Content */}
            <div className="mb-4">
              <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                {post.post_type === 'discussion' || post.post_type === 'question' 
                  ? post.content.split('\n').slice(1).join('\n')
                  : post.content
                }
              </p>
              
              {/* Post Images */}
              {post.images && post.images.length > 0 && (
                <div className={`grid gap-3 mt-4 ${
                  post.images.length === 1 ? 'grid-cols-1' :
                  post.images.length === 2 ? 'grid-cols-2' :
                  'grid-cols-2'
                }`}>
                  {post.images.map((imageUrl: string, index: number) => (
                    <div key={index} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`Post image ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg bg-gray-700"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Meal Plan Preview */}
              {post.post_type === 'meal_share' && post.meal_title && (
                <div className="mt-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
                  <div className="flex items-center gap-3">
                    {post.meal_image && (
                      <img
                        src={post.meal_image}
                        alt={post.meal_title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h3 className="font-medium text-white">{post.meal_title}</h3>
                      <p className="text-sm text-gray-400">Shared meal plan</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
              <div className="flex items-center gap-6">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`text-gray-400 hover:text-white p-1 ${
                    post.is_liked ? 'text-red-400' : ''
                  }`}
                  onClick={() => handleLikePost(post.id)}
                >
                  <ThumbsUp className="w-5 h-5 mr-2" />
                  <span className="text-sm">Like</span>
                  <span className="ml-1 text-sm">{post.likes_count}</span>
                </Button>
                
                <span className="text-gray-400 text-sm">
                  {post.comments_count} {post.comments_count === 1 ? 'comment' : 'comments'}
                </span>
              </div>
              
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-1">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <CommentsSection
          postId={post.id}
          communityId={parseInt(communityId!)}
          commentsCount={post.comments_count}
          isExpanded={true}
          onToggle={() => {}} // Not needed in detail view
        />
      </div>
    </div>
  );
}