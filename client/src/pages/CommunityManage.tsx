import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Users,
  Settings,
  BarChart3,
  Crown,
  Globe,
  Lock,
  DollarSign,
  Star,
  Heart,
  MessageSquare,
  Share2,
  Edit3,
  Save,
  X,
  Calendar,
  TrendingUp,
  UserPlus,
  Activity
} from "lucide-react";

export default function CommunityManage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch community details using the correct endpoint
  const { data: community, isLoading } = useQuery({
    queryKey: [`/api/communities/${id}`],
    enabled: !!id,
  });

  // Fetch community stats
  const { data: stats } = useQuery({
    queryKey: [`/api/communities/${id}/stats`],
    enabled: !!id,
  });

  // Update community mutation
  const updateCommunity = useMutation({
    mutationFn: async (updates: any) => {
      return await apiRequest(`/api/communities/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      toast({
        title: "Community Updated",
        description: "Your community has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/communities", id] });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading community...</p>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Community Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">The community you're looking for doesn't exist or you don't have access to it.</p>
            <Button onClick={() => setLocation("/creator-hub")}>
              Back to Creator Hub
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "budget":
        return <DollarSign className="w-5 h-5" />;
      case "family":
        return <Users className="w-5 h-5" />;
      case "diet":
        return <Heart className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "budget":
        return "bg-green-100 text-green-800";
      case "family":
        return "bg-blue-100 text-blue-800";
      case "diet":
        return "bg-red-100 text-red-800";
      default:
        return "bg-purple-100 text-purple-800";
    }
  };

  const formatCategoryName = (category: string) => {
    switch (category) {
      case "budget":
        return "Budget Meals";
      case "family":
        return "Family Cooking";
      case "diet":
        return "Diet & Health";
      default:
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/communities")}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Creator Hub
          </Button>

          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{(community as any)?.name || "Community"}</h1>
                <Badge className={`flex items-center gap-1 ${getCategoryColor((community as any)?.category || "")}`}>
                  {getCategoryIcon((community as any)?.category || "")}
                  {formatCategoryName((community as any)?.category || "")}
                </Badge>
                <Badge className="bg-purple-100 text-purple-800">
                  <Crown className="w-3 h-3 mr-1" />
                  Public
                </Badge>
              </div>
              <p className="text-gray-600 max-w-2xl">{(community as any)?.description || "No description"}</p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Members</p>
                    <p className="text-2xl font-bold text-gray-900">{(community as any)?.member_count || 1}</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">New This Week</p>
                    <p className="text-2xl font-bold text-gray-900">{(stats as any)?.newMembersThisWeek || 0}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Engagement Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{(stats as any)?.engagementRate || 0}%</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Active Today</p>
                    <p className="text-2xl font-bold text-gray-900">{(stats as any)?.activeToday || 0}</p>
                  </div>
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Members
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="monetization" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Monetization
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue & Analytics */}
              <Card className="bg-white border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Revenue & Analytics</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Monetization dashboard coming soon</h3>
                    <p className="text-sm text-gray-500">Track your revenue, manage subscriptions, and view financial analytics here.</p>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-white border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm">No recent activity yet</p>
                      <p className="text-xs text-gray-400 mt-1">Community posts and interactions will appear here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            <Card className="bg-white border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Community Members</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm">Members management coming soon</p>
                  <p className="text-xs text-gray-400 mt-1">View and manage your community members</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card className="bg-white border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Community Posts</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm">Content management coming soon</p>
                  <p className="text-xs text-gray-400 mt-1">Manage community posts, comments, and content moderation</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monetization Tab */}
          <TabsContent value="monetization" className="space-y-6">
            <Card className="bg-white border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Revenue & Analytics</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Monetization dashboard coming soon</h3>
                  <p className="text-sm text-gray-500 mb-4">Track your revenue, manage subscriptions, and view financial analytics here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Community Settings</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Community ID</Label>
                    <p className="text-sm text-gray-600">{(community as any)?.id || "N/A"}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="text-sm text-gray-600">
                      {(community as any)?.created_at ? new Date((community as any).created_at).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Last Updated</Label>
                    <p className="text-sm text-gray-600">
                      {(community as any)?.updated_at ? new Date((community as any).updated_at).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  
                  <Button onClick={() => setIsEditing(true)} className="mt-4">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
