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
  ChevronDown, CheckCircle, Play, BookOpen, Share, Eye
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ImageUploader } from "@/components/ImageUploader";
import { MealPlanEditor } from "@/components/community/MealPlanEditor";
import { LessonEditor } from "@/components/community/LessonEditor";
import EnhancedLessonEditor from "@/components/community/EnhancedLessonEditor";
import InlineLessonEditor from "@/components/community/InlineLessonEditor";
import RecipeDisplay from "@/components/RecipeDisplay";

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
  meal_plan?: any; // Full meal plan data for meal_share posts
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
  const [isStudentViewMode, setIsStudentViewMode] = useState(false);
  const [showMealPlanEditor, setShowMealPlanEditor] = useState(false);
  const [expandedCourses, setExpandedCourses] = useState<number[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch courses from API
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: [`/api/communities/${communityId}/courses`, isStudentViewMode],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/communities/${communityId}/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch courses');
      const data = await response.json();
      
      // Filter courses based on user role and view mode
      if (isCreator && !isStudentViewMode) {
        // Creators in normal mode see all courses (published and drafts)
        return data;
      } else {
        // Regular users and creators in student view only see published courses
        return data.filter((course: any) => course.is_published);
      }
    },
    enabled: !!communityId,
  });

  // Toggle course expansion
  const toggleCourseExpansion = (courseId: number) => {
    setExpandedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  // Loading state
  if (coursesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (showLessonView && selectedLesson) {
    return (
      <InlineLessonEditor
        lesson={selectedLesson}
        communityId={communityId || ''}
        courseId={selectedCourse?.id || 0}
        isCreator={isCreator}
        onClose={() => setShowLessonView(false)}
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Creator Course Management and Student View Toggle */}
      {isCreator && (
        <div className="flex items-center justify-between -mt-2 gap-4">
          <div className="flex justify-center flex-1">
            <Button
              onClick={() => setShowMealPlanEditor(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Courses
            </Button>
          </div>
          
          {/* User View Toggle */}
          <Button
            onClick={() => setIsStudentViewMode(!isStudentViewMode)}
            variant={isStudentViewMode ? "secondary" : "outline"}
            className={isStudentViewMode ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600" : "border-gray-600 text-gray-300 hover:bg-gray-700"}
            size="sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            {isStudentViewMode ? "Exit User View" : "User View"}
          </Button>
        </div>
      )}

      {/* User View Indicator */}
      {isCreator && isStudentViewMode && (
        <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-3 -mt-1">
          <p className="text-sm text-blue-400 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            User View Mode - Showing only published courses visible to users
          </p>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            {isCreator && !isStudentViewMode ? "No Courses Created Yet" : "No Published Courses Available"}
          </h3>
          <p className="text-gray-400 mb-6">
            {isCreator && !isStudentViewMode
              ? "Create your first course to get started with meal planning!" 
              : isCreator && isStudentViewMode
              ? "No published courses visible to users yet. Exit User View to see drafts."
              : "The creator hasn't published any courses yet. Check back soon!"
            }
          </p>
          {isCreator && !isStudentViewMode && (
            <Button
              onClick={() => setShowMealPlanEditor(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Course
            </Button>
          )}
        </div>
      ) : (
        // Course Cards Grid - Skool Style
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course: any) => (
            <Card 
              key={course.id}
              className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-200 cursor-pointer group overflow-hidden"
              onClick={() => toggleCourseExpansion(course.id)}
            >
              {/* Course Cover Image */}
              <div className="relative h-32 bg-gradient-to-br from-purple-600 via-blue-600 to-emerald-600 overflow-hidden">
                {course.cover_image ? (
                  <img 
                    src={course.cover_image} 
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl opacity-80">{course.emoji || '📚'}</span>
                  </div>
                )}
                
                {/* Status Badge - Only show for creators not in student view */}
                {!isStudentViewMode && (
                  <div className="absolute top-3 right-3">
                    {course.is_published ? (
                      <Badge className="bg-green-600/90 text-white text-xs backdrop-blur-sm">
                        Published
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-600/90 text-white text-xs backdrop-blur-sm">
                        Draft
                      </Badge>
                    )}
                  </div>
                )}

                {/* Progress Bar - Bottom of Image */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                  <div 
                    className="h-full bg-white/80 transition-all duration-300"
                    style={{ width: '0%' }} // TODO: Calculate actual progress
                  />
                </div>
              </div>

              {/* Course Content */}
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Title and Stats */}
                  <div>
                    <h3 className="font-semibold text-white text-lg leading-tight group-hover:text-purple-300 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                      {course.description || "Comprehensive meal planning course with practical lessons"}
                    </p>
                  </div>

                  {/* Course Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {course.lesson_count} lessons
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        0 enrolled
                      </span>
                    </div>
                    <span className="font-medium">0%</span>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm h-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCourseExpansion(course.id);
                      }}
                    >
                      {expandedCourses.includes(course.id) ? (
                        <>
                          <ChevronDown className="h-3 w-3 mr-1" />
                          Hide Lessons
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 mr-1" />
                          View Lessons
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>

              {/* Expanded Lessons - Mobile Friendly */}
              {expandedCourses.includes(course.id) && (
                <div className="border-t border-gray-700 bg-gray-800/50">
                  <div className="p-4 space-y-3">
                    {/* Modules */}
                    {course.modules?.map((module: any) => (
                      <div key={module.id} className="space-y-2">
                        <div className="flex items-center gap-2 py-2 px-3 bg-purple-600/20 rounded-lg">
                          <BookOpen className="h-4 w-4 text-purple-400 flex-shrink-0" />
                          <span className="text-purple-300 font-medium text-sm">{module.title}</span>
                          <span className="text-xs text-gray-400 ml-auto">
                            {module.lessons?.length || 0} lessons
                          </span>
                        </div>
                        
                        {/* Module Lessons */}
                        <div className="space-y-1 ml-4">
                          {module.lessons?.map((lesson: any) => (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-3 py-2 px-3 hover:bg-gray-700/50 rounded cursor-pointer transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCourse(course);
                                setSelectedLesson(lesson);
                                setShowLessonView(true);
                              }}
                            >
                              <span className="text-sm">🍽️</span>
                              <span className="text-white text-sm font-medium flex-1">{lesson.title}</span>
                              {lesson.prep_time && (
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {lesson.prep_time + (lesson.cook_time || 0)}min
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    {/* Standalone Lessons */}
                    {course.lessons?.filter((lesson: any) => !lesson.module_id).map((lesson: any) => (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-3 py-2 px-3 hover:bg-gray-700/50 rounded cursor-pointer transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCourse(course);
                          setSelectedLesson(lesson);
                          setShowLessonView(true);
                        }}
                      >
                        <span className="text-sm">🍽️</span>
                        <span className="text-white text-sm font-medium flex-1">{lesson.title}</span>
                        {lesson.prep_time && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {lesson.prep_time + (lesson.cook_time || 0)}min
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}



      {/* Meal Plan Editor Modal for Creators */}
      {showMealPlanEditor && isCreator && (
        <MealPlanEditor 
          communityId={communityId || ''} 
          onClose={() => {
            setShowMealPlanEditor(false);
            // Refresh the courses list
            queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/courses`] });
          }}
        />
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
  const [showMealPlanEditorMain, setShowMealPlanEditorMain] = useState(false);

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
              </div>
            )}
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
                        {/* Creator-only New Course button */}
                        {isCreator && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-emerald-400 hover:text-emerald-300 p-2"
                            onClick={() => setShowMealPlanEditorMain(true)}
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
                    {/* Only show content for non-meal_share posts */}
                    {post.post_type !== 'meal_share' && (
                      <p className="text-gray-200 mb-3">{post.content}</p>
                    )}
                    
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
                    
                    {/* Meal Share with Tabs - Always show for meal_share posts */}
                    {post.post_type === 'meal_share' ? (
                      <div className="bg-gray-700 rounded-lg mb-3" onClick={(e) => e.stopPropagation()}>
                        <Tabs defaultValue="message" className="w-full">
                          <TabsList className="grid w-full grid-cols-2 bg-gray-600">
                            <TabsTrigger value="message" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">Message</TabsTrigger>
                            <TabsTrigger value="meal" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">Meal</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="message" className="p-4">
                            <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                              {post.content}
                            </p>
                          </TabsContent>
                          
                          <TabsContent value="meal" className="p-4">
                            {post.meal_plan ? (
                              <div>
                                <RecipeDisplay
                                  recipe={(() => {
                                  // Extract the first recipe from the meal plan
                                  const mealPlan = post.meal_plan?.meal_plan;
                                  
                                  // Debug: Log the entire meal plan structure
                                  console.log('=== DEBUG: Full meal plan data ===', {
                                    meal_plan: post.meal_plan,
                                    mealPlan: mealPlan
                                  });
                                  
                                  const firstDay = mealPlan?.day_1 || mealPlan?.days?.day1;
                                  const firstMeal = firstDay?.breakfast || firstDay?.lunch || firstDay?.dinner;
                                  
                                  // Debug: Log the extracted meal
                                  console.log('=== DEBUG: Extracted meal ===', {
                                    firstDay,
                                    firstMeal,
                                    ingredients: firstMeal?.ingredients,
                                    ingredientsType: Array.isArray(firstMeal?.ingredients) ? 'array' : typeof firstMeal?.ingredients
                                  });
                                  
                                  if (!firstMeal) {
                                    console.log('=== DEBUG: No meal found, returning default ===');
                                    return {
                                      id: post.meal_plan?.id,
                                      title: post.meal_plan?.name || 'Shared Recipe',
                                      description: post.meal_plan?.description || '',
                                      image_url: '/api/placeholder/400/300',
                                      ingredients: [],
                                      instructions: [],
                                      time_minutes: 30,
                                      cuisine: '',
                                      diet: ''
                                    };
                                  }
                                  
                                  // Process ingredients to ensure correct format
                                  let processedIngredients = [];
                                  if (Array.isArray(firstMeal.ingredients)) {
                                    processedIngredients = firstMeal.ingredients.map((ing: any, index: number) => {
                                      // Debug each ingredient
                                      console.log(`=== DEBUG: Ingredient ${index} ===`, ing);
                                      
                                      // Handle different ingredient formats
                                      if (typeof ing === 'string') {
                                        // Simple string format
                                        return {
                                          name: ing,
                                          display_text: ing,
                                          measurements: []
                                        };
                                      } else if (ing && typeof ing === 'object') {
                                        // Object format - try to extract proper fields
                                        return {
                                          name: ing.name || ing.ingredient || ing.item || '',
                                          display_text: ing.display_text || ing.text || ing.description || `${ing.quantity || ''} ${ing.unit || ''} ${ing.name || ing.ingredient || ''}`.trim(),
                                          measurements: ing.measurements || (ing.quantity ? [{
                                            quantity: parseFloat(ing.quantity) || 0,
                                            unit: ing.unit || ''
                                          }] : [])
                                        };
                                      }
                                      return null;
                                    }).filter(Boolean);
                                  }
                                  
                                  console.log('=== DEBUG: Processed ingredients ===', processedIngredients);
                                  
                                  const recipeData = {
                                    id: post.meal_plan?.id,
                                    title: firstMeal.name || firstMeal.title || post.meal_plan?.name || 'Shared Recipe',
                                    description: firstMeal.description || post.meal_plan?.description || '',
                                    image_url: firstMeal.image_url || '/api/placeholder/400/300',
                                    ingredients: processedIngredients,
                                    instructions: Array.isArray(firstMeal.instructions) ? firstMeal.instructions : [],
                                    nutrition_info: firstMeal.nutrition || null,
                                    time_minutes: firstMeal.prep_time || firstMeal.time_minutes || firstMeal.cook_time_minutes || 30,
                                    cuisine: firstMeal.cuisine || '',
                                    diet: firstMeal.diet || '',
                                    video_id: firstMeal.video_id || null,
                                    video_title: firstMeal.video_title || null,
                                    video_channel: firstMeal.video_channel || null
                                  };
                                  
                                  console.log('=== DEBUG: Final recipe data ===', recipeData);
                                  
                                  return recipeData;
                                  })()}
                                  onRegenerateClick={() => {}}
                                />
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <p className="text-gray-400">Meal details coming soon...</p>
                              </div>
                            )}
                          </TabsContent>
                        </Tabs>
                      </div>
                    ) : null}
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
        <TabsContent value="meals" className="p-4 space-y-4 mt-2 pt-2 bg-gray-900">
          <MealPlansClassroom communityId={id} isCreator={isCreator} />
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

      {/* Global Meal Plan Editor Modal for Creators */}
      {showMealPlanEditorMain && isCreator && (
        <MealPlanEditor 
          communityId={id || ''} 
          onClose={() => {
            setShowMealPlanEditorMain(false);
            // Refresh the courses list
            queryClient.invalidateQueries({ queryKey: [`/api/communities/${id}/courses`] });
          }}
        />
      )}
    </div>
  );
}