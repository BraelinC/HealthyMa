import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Users, Calendar, MessageSquare, Heart, ChefHat, ArrowLeft, Settings,
  Pin, ThumbsUp, MessageCircle, Share2, Camera, Plus, Search,
  Clock, TrendingUp, User, MoreHorizontal, Send, Menu, X,
  ChevronDown, CheckCircle, Play, BookOpen
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ImageUploader } from "@/components/ImageUploader";

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
  isMember?: boolean;
  isCreator?: boolean;
}

interface CommunityPost {
  id: number;
  user_id: string;
  author_id: string; // Add author_id for checking post ownership
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

interface MealPlan {
  id: number;
  title: string;
  description: string;
  image_url?: string;
  video_url?: string;
  youtube_video_id?: string;
  ingredients: string[];
  instructions: string[];
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  creator_name: string;
  created_at: string;
  likes_count: number;
  is_liked: boolean;
}

// Meal Plans Classroom Component (Skool-style)
function MealPlansClassroom({ communityId, isCreator }: { communityId?: string; isCreator: boolean }) {
  const [showCreateCourseForm, setShowCreateCourseForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [showLessonView, setShowLessonView] = useState(false);
  const { toast } = useToast();

  // Mock data representing Skool-style courses/modules with lessons
  const mockCourses = [
    {
      id: 1,
      title: "Start Here",
      emoji: "🌟",
      progress_percentage: 25,
      isExpanded: false,
      lessons: [
        { id: 1, title: "The Mission", emoji: "🚀", completed: false },
        { id: 2, title: "Introduce Yourself", emoji: "👋", completed: false },
        { id: 3, title: "Roadmap", emoji: "🗺️", completed: false },
        { id: 4, title: "All ABOARD", emoji: "📢", completed: false },
        { id: 5, title: "Rules & Guidelines", emoji: "👮", completed: false },
        { id: 6, title: "Meet The Team", emoji: "👨‍👩‍👧‍👦", completed: false },
        { id: 7, title: "Calendar", emoji: "📅", completed: false },
      ]
    },
    {
      id: 2,
      title: "Healthy Family Meal Plans",
      emoji: "🍽️",
      progress_percentage: 0,
      isExpanded: false,
      lessons: [
        { id: 8, title: "Meal Planning Basics", emoji: "📋", completed: false },
        { id: 9, title: "Quick Breakfast Ideas", emoji: "🥞", completed: false },
        { id: 10, title: "Balanced Lunch Recipes", emoji: "🥗", completed: false },
        { id: 11, title: "Healthy Dinner Options", emoji: "🍲", completed: false },
        { id: 12, title: "Kid-Friendly Snacks", emoji: "🍎", completed: false },
        { id: 13, title: "Weekly Meal Prep", emoji: "📦", completed: false },
      ]
    },
    {
      id: 3,
      title: "Budget-Friendly Cooking",
      emoji: "💰",
      progress_percentage: 0,
      isExpanded: false,
      lessons: [
        { id: 14, title: "Shopping Smart", emoji: "🛒", completed: false },
        { id: 15, title: "Pantry Staples", emoji: "🏪", completed: false },
        { id: 16, title: "Bulk Cooking Strategies", emoji: "👥", completed: false },
        { id: 17, title: "Leftover Magic", emoji: "✨", completed: false },
      ]
    }
  ];

  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set([1])); // Start Here expanded by default

  const toggleCourseExpansion = (courseId: number) => {
    setExpandedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  if (showLessonView && selectedLesson) {
    return (
      <div className="space-y-6">
        {/* Lesson Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLessonView(false)}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{selectedLesson.title}</h1>
            <p className="text-gray-400">{selectedCourse?.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              Previous
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              Next →
            </Button>
          </div>
        </div>

        {/* Lesson Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video/Image */}
            <Card className="bg-gray-800 border-gray-700">
              <div className="aspect-video bg-gray-700 rounded-t-lg flex items-center justify-center">
                <div className="text-center">
                  <Play className="h-12 w-12 text-purple-400 mx-auto mb-2" />
                  <p className="text-gray-400">Video lesson will appear here</p>
                </div>
              </div>
            </Card>

            {/* Description */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-3">About This Lesson</h3>
                <p className="text-gray-300 leading-relaxed">
                  Learn the fundamentals of meal planning that will save you time and money while ensuring your family eats healthy, delicious meals every day.
                </p>
              </CardContent>
            </Card>

            {/* Ingredients & Instructions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Ingredients</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-300">
                    <li>• 1 cup rice</li>
                    <li>• 2 cups water</li>
                    <li>• 1 tsp salt</li>
                    <li>• 2 tbsp butter</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2 text-gray-300">
                    <li>1. Rinse rice until water runs clear</li>
                    <li>2. Bring water and salt to boil</li>
                    <li>3. Add rice and reduce heat</li>
                    <li>4. Simmer for 18 minutes</li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Progress */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">Your Progress</span>
                  <span className="text-xs text-gray-400">{selectedCourse?.progress_percentage}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${selectedCourse?.progress_percentage}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            {/* Course Lessons */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Course Lessons</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {selectedCourse?.lessons?.map((lesson: any, index: number) => (
                  <div 
                    key={lesson.id}
                    className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                      lesson.id === selectedLesson.id 
                        ? 'bg-purple-600/20 border border-purple-600/30' 
                        : 'hover:bg-gray-700'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      lesson.completed 
                        ? 'bg-green-600 text-white' 
                        : lesson.id === selectedLesson.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-600 text-gray-300'
                    }`}>
                      {lesson.completed ? '✓' : index + 1}
                    </div>
                    <span className={`text-sm ${
                      lesson.id === selectedLesson.id ? 'text-purple-400' : 'text-gray-300'
                    }`}>
                      {lesson.title}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Progress Summary - First Course */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">{mockCourses[0]?.title}</h2>
        <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
          <div 
            className="bg-purple-600 h-3 rounded-full" 
            style={{ width: `${mockCourses[0]?.progress_percentage}%` }}
          ></div>
        </div>
        <span className="text-xs text-gray-400">{mockCourses[0]?.progress_percentage}%</span>
      </div>

      {/* Course/Module List - Skool Style */}
      <div className="space-y-1">
        {mockCourses.map((course) => (
          <div key={course.id}>
            {/* Course Header */}
            <div 
              className="flex items-center justify-between py-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
              onClick={() => toggleCourseExpansion(course.id)}
            >
              <div className="flex items-center gap-3">
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${
                  expandedCourses.has(course.id) ? 'rotate-0' : '-rotate-90'
                }`} />
                <span className="text-lg font-semibold text-white">{course.title} {course.emoji}</span>
              </div>
              {course.progress_percentage > 0 && (
                <span className="text-xs text-gray-400">{course.progress_percentage}%</span>
              )}
            </div>

            {/* Lessons List - Only show if expanded */}
            {expandedCourses.has(course.id) && (
              <div className="ml-7 space-y-1">
                {course.lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-3 py-3 px-4 hover:bg-gray-800/30 rounded cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedCourse(course);
                      setSelectedLesson(lesson);
                      setShowLessonView(true);
                    }}
                  >
                    <span className="text-lg">{lesson.emoji}</span>
                    <span className="text-white font-medium">{lesson.title}</span>
                    {lesson.completed && (
                      <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Creator Controls */}
      {isCreator && (
        <div className="mt-8 pt-6 border-t border-gray-700">
          <Button
            onClick={() => setShowCreateCourseForm(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Course
          </Button>
        </div>
      )}
    </div>
  );
}

export default function CommunityDetailNew() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newPostContent, setNewPostContent] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const navigateToPost = (postId: number) => {
    setLocation(`/community/${id}/post/${postId}`);
  };


  // Fetch community details
  const { data: community, isLoading } = useQuery({
    queryKey: ["/api/communities", id],
    queryFn: async () => {
      const { apiRequest } = await import("@/lib/queryClient");
      return await apiRequest(`/api/communities/${id}`, {
        method: "GET",
      });
    },
    enabled: !!id && isAuthenticated,
  });

  // Temporarily disable API call to show mock posts with the visual style you liked
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: [`/api/communities/${id}/posts`, activeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeFilter !== "all") {
        params.append("type", activeFilter === "meal-shares" ? "meal_share" : activeFilter);
      }
      const queryString = params.toString();
      const url = `/api/communities/${id}/posts${queryString ? `?${queryString}` : ""}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    },
    enabled: !!id && !!community, // Re-enabled to show real posts
  });

  // Check if user is already a member based on memberInfo existence
  const isMember = community?.memberInfo || community?.isMember;
  const isCreator = community?.memberInfo?.role === 'creator' || community?.creator_id === (user as any)?.user?.id || community?.creator_id === (user as any)?.id;

  // Mock posts data (replace with real API call later)
  const mockPosts: CommunityPost[] = [
    {
      id: 1,
      user_id: "user_123",
      author_id: "user_123",
      username: "Sarah Chen",
      content: "Just shared my latest 7-day meal prep plan focused on high-protein, budget-friendly meals! Perfect for busy families.",
      post_type: "meal_share",
      meal_plan_id: 123,
      meal_title: "High-Protein Family Meal Prep",
      meal_image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop",
      likes_count: 15,
      comments_count: 8,
      is_pinned: true,
      is_liked: false,
      created_at: "2 hours ago"
    },
    {
      id: 2,
      user_id: "user_456",
      author_id: "user_456",
      username: "Mike Johnson",
      content: "Welcome to our community! This is the place to share your meal planning wins, ask questions, and discover new recipes. Let's support each other on our healthy eating journey! 🥗",
      post_type: "announcement",
      likes_count: 24,
      comments_count: 12,
      is_pinned: false,
      is_liked: true,
      created_at: "1 day ago"
    },
    {
      id: 3,
      user_id: "user_789",
      author_id: "user_789",
      username: "Emily Rodriguez",
      content: "Quick question - has anyone tried meal prepping with a toddler around? Looking for tips on how to make it work with little ones 'helping' in the kitchen! 😅",
      post_type: "question",
      likes_count: 7,
      comments_count: 15,
      is_pinned: false,
      is_liked: false,
      created_at: "3 days ago"
    }
  ];

  // Create new post mutation
  const createPostMutation = useMutation({
    mutationFn: async ({ content, images }: { content: string; images: string[] }) => {
      const { apiRequest } = await import("@/lib/queryClient");
      return await apiRequest(`/api/communities/${id}/posts`, {
        method: "POST",
        body: JSON.stringify({ 
          content, 
          post_type: "discussion",
          images: images || [],
        }),
      });
    },
    onSuccess: () => {
      setNewPostContent("");
      setSelectedImages([]);
      // Invalidate both the generic and filtered query keys
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${id}/posts`] });
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${id}/posts`, activeFilter] });
      toast({
        title: "Post shared!",
        description: "Your post has been shared with the community.",
      });
    },
  });

  const toggleLikeMutation = useMutation({
    mutationFn: async (postId: number) => {
      const { apiRequest } = await import("@/lib/queryClient");
      return await apiRequest(`/api/communities/${id}/posts/${postId}/like`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${id}/posts`] });
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${id}/posts`, activeFilter] });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to toggle like. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Join community mutation
  const joinCommunityMutation = useMutation({
    mutationFn: async () => {
      const { apiRequest } = await import("@/lib/queryClient");
      return await apiRequest(`/api/communities/${id}/join`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/communities", id] });
      toast({
        title: "Welcome!",
        description: "You've joined the community successfully.",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-xl font-semibold mb-2">Community not found</h2>
          <Link href="/communities">
            <Button variant="outline">Back to Communities</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'meal_share': return <ChefHat className="w-4 h-4" />;
      case 'announcement': return <Pin className="w-4 h-4" />;
      case 'question': return <MessageCircle className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getPostTypeBadge = (type: string) => {
    switch (type) {
      case 'meal_share': return <Badge className="bg-green-600 text-white">Meal Share</Badge>;
      case 'announcement': return <Badge className="bg-blue-600 text-white">Announcement</Badge>;
      case 'question': return <Badge className="bg-orange-600 text-white">Question</Badge>;
      default: return <Badge className="bg-gray-600 text-white">Discussion</Badge>;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 text-white overflow-y-auto z-[9999]" style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 9999
    }}>
      {/* Mobile Header - Sticky position */}
      <header className="sticky top-0 z-50 bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/communities">
              <Button variant="ghost" size="sm" className="text-white p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-purple-600 text-white text-sm">
                  {community.name[0]}
                </AvatarFallback>
              </Avatar>
              <h1 className="font-semibold text-lg">{community.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Creator Dashboard Access */}
            {isCreator && (
              <div className="flex items-center gap-2 mr-2">
                <Badge className="bg-emerald-600 text-white text-xs">
                  Creator
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-emerald-400 hover:text-emerald-300 p-2"
                  onClick={() => toast({ 
                    title: "Creator Mode", 
                    description: "You're viewing this community with creator privileges" 
                  })}
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </div>
            )}
            <Button variant="ghost" size="sm" className="text-white p-2">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white p-2">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Tab Navigation - Sticky position */}
      <Tabs defaultValue="community" className="w-full bg-gray-900">
        <TabsList className="sticky top-0 z-40 w-full bg-gray-800 border-b border-gray-700 rounded-none h-12">
          <TabsTrigger value="community" className="flex-1 bg-gray-800 text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white hover:bg-gray-700 hover:text-white">
            Community
          </TabsTrigger>
          <TabsTrigger value="meals" className="flex-1 bg-gray-800 text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white hover:bg-gray-700 hover:text-white">
            Meal Plans
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex-1 bg-gray-800 text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white hover:bg-gray-700 hover:text-white">
            Calendar
          </TabsTrigger>
          <TabsTrigger value="members" className="flex-1 bg-gray-800 text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white hover:bg-gray-700 hover:text-white">
            Members
          </TabsTrigger>
        </TabsList>

        {/* Community Tab Content */}
        <TabsContent value="community" className="p-4 space-y-4 bg-gray-900 min-h-screen">
          {/* Community Stats Banner - Only show for non-members */}
          {!isMember && (
            <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-none">
              <CardContent className="p-4 text-white">
                <h3 className="font-semibold mb-2">Join {community.name}</h3>
                <p className="text-sm mb-3 opacity-90">{community.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{community.member_count} members</span>
                  <Button 
                    onClick={() => joinCommunityMutation.mutate()}
                    disabled={joinCommunityMutation.isPending}
                    className="bg-white text-purple-600 hover:bg-gray-100"
                  >
                    {joinCommunityMutation.isPending ? "Joining..." : "Join Community"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Post Creation - Only show for members */}
          {isMember && (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-purple-600 text-white">
                      {(user as any)?.firstName?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <Textarea
                      placeholder="Share something with the community..."
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 resize-none"
                      rows={3}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2 items-center">
                        <ImageUploader 
                          onImagesChange={setSelectedImages}
                          maxImages={4}
                        />
                        <Button variant="ghost" size="sm" className="text-gray-400 p-2">
                          <ChefHat className="w-4 h-4" />
                        </Button>
                        {/* Creator-only New Course button */}
                        {isCreator && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-emerald-400 hover:text-emerald-300 p-2"
                            onClick={() => toast({ 
                              title: "New Course", 
                              description: "Course creation feature coming soon!" 
                            })}
                          >
                            <Plus className="w-4 h-4" />
                            <span className="ml-1 text-xs">Course</span>
                          </Button>
                        )}
                      </div>
                      <Button 
                        onClick={() => createPostMutation.mutate({ content: newPostContent, images: selectedImages })}
                        disabled={!newPostContent.trim() || createPostMutation.isPending}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Send className="w-4 h-4 mr-1" />
                        {createPostMutation.isPending ? "Posting..." : "Post"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {["all", "updates", "discussions", "questions", "meal-shares"].map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter)}
                className={`flex-shrink-0 capitalize ${
                  activeFilter === filter 
                    ? "bg-purple-600 text-white" 
                    : "bg-gray-800 text-gray-300 border-gray-600"
                }`}
              >
                {filter.replace("-", " ")}
              </Button>
            ))}
          </div>

          {/* Posts Feed */}
          <div className="space-y-4">
            {posts.length === 0 && !postsLoading && (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No posts yet</h3>
                  <p className="text-gray-400">Be the first to share something with the community!</p>
                </CardContent>
              </Card>
            )}
            {posts.map((post: any) => (
              <Card 
                key={post.id} 
                className="bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors"
                onClick={() => navigateToPost(post.id)}
              >
                <CardContent className="p-4">
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-blue-600 text-white">
                          {post.username[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-white">{post.username}</h4>
                          {getPostTypeBadge(post.post_type)}
                        </div>
                        <p className="text-sm text-gray-400">{post.created_at}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {post.is_pinned && <Pin className="w-4 h-4 text-purple-400" />}
                      {/* Creator Controls */}
                      {isCreator && (
                        <div className="flex items-center gap-1 ml-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-green-400 hover:text-green-300 p-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              toast({ title: "Post pinned", description: "This post is now pinned to the top." });
                            }}
                          >
                            <Pin className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-orange-400 hover:text-orange-300 p-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              toast({ title: "Post hidden", description: "This post has been hidden from the community." });
                            }}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      <Button variant="ghost" size="sm" className="text-gray-400 p-1">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="mb-4">
                    <p className="text-gray-200 mb-3">{post.content}</p>
                    
                    {/* Post Images */}
                    {post.images && post.images.length > 0 && (
                      <div className={`grid gap-2 mb-3 ${
                        post.images.length === 1 ? 'grid-cols-1' :
                        post.images.length === 2 ? 'grid-cols-2' :
                        'grid-cols-2'
                      }`}>
                        {post.images.slice(0, 4).map((imageUrl: string, index: number) => (
                          <div key={index} className="relative group">
                            <img
                              src={imageUrl}
                              alt={`Post image ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg bg-gray-700"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                            {post.images!.length > 4 && index === 3 && (
                              <div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg flex items-center justify-center">
                                <span className="text-white font-medium">+{post.images!.length - 4}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Meal Share Preview */}
                    {post.post_type === 'meal_share' && post.meal_image && (
                      <div className="bg-gray-700 rounded-lg p-3 mb-3">
                        <div className="flex gap-3">
                          <img 
                            src={post.meal_image} 
                            alt={post.meal_title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h5 className="font-medium text-white mb-1">{post.meal_title}</h5>
                            <p className="text-sm text-gray-400">Tap to view full meal plan</p>
                          </div>
                          <ChefHat className="w-5 h-5 text-green-400" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Post Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                    <div className="flex items-center gap-4">
                      {/* Only show like button for other users' posts */}
                      {(user as any)?.user?.id !== post.author_id && (user as any)?.id !== post.author_id ? (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`p-1 transition-colors ${
                            post.is_liked 
                              ? "text-purple-400 hover:text-purple-300" 
                              : "text-gray-400 hover:text-white"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLikeMutation.mutate(post.id);
                          }}
                          disabled={toggleLikeMutation.isPending}
                        >
                          <ThumbsUp className={`w-4 h-4 mr-1 ${post.is_liked ? "fill-purple-400" : ""}`} />
                          {post.likes_count}
                        </Button>
                      ) : (
                        // Show likes count only for own posts (if > 0)
                        post.likes_count > 0 && (
                          <div className="text-gray-400 text-sm flex items-center p-1">
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            {post.likes_count}
                          </div>
                        )
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-400 hover:text-white p-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateToPost(post.id);
                        }}
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        {post.comments_count}
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-1">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>


                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Meal Plans Tab - Classroom Style */}
        <TabsContent value="meals" className="p-4 space-y-4 mt-12 pt-4 bg-gray-900">
          <MealPlansClassroom communityId={id} isCreator={isCreator} />
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="p-4 space-y-4 mt-12 pt-4 bg-gray-900">
          <div className="text-center py-8">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Community Calendar</h3>
            <p className="text-gray-400">View upcoming events and challenges</p>
          </div>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="p-4 space-y-4 mt-12 pt-4 bg-gray-900">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Members ({community.member_count})</h3>
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                <Plus className="w-4 h-4 mr-1" />
                Invite
              </Button>
            </div>
            
            {/* Member List Preview */}
            <div className="space-y-3">
              {[
                { name: "Sarah Chen", role: "Creator", level: 15 },
                { name: "Mike Johnson", role: "Moderator", level: 12 },
                { name: "Emily Rodriguez", role: "Member", level: 8 },
              ].map((member, index) => (
                <Card key={index} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-purple-600 text-white">
                            {member.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium text-white">{member.name}</h4>
                          <p className="text-sm text-gray-400">{member.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <TrendingUp className="w-3 h-3" />
                          Level {member.level}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}