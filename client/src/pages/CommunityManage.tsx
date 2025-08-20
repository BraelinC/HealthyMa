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

  // Fetch community details
  const { data: community, isLoading } = useQuery({
    queryKey: ["/api/communities", id],
    enabled: !!id,
  });

  // Fetch community stats
  const { data: stats } = useQuery({
    queryKey: ["/api/communities", id, "stats"],
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/creator-hub")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Creator Hub
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{(community as any)?.name || "Community"}</h1>
                <Badge className={`flex items-center gap-1 ${getCategoryColor((community as any)?.category || "")}`}>
                  {getCategoryIcon((community as any)?.category || "")}
                  {formatCategoryName((community as any)?.category || "")}
                </Badge>
                <Badge variant={(community as any)?.is_public ? "default" : "secondary"}>
                  {(community as any)?.is_public ? (
                    <>
                      <Globe className="w-3 h-3 mr-1" />
                      Public
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 mr-1" />
                      Private
                    </>
                  )}
                </Badge>
              </div>
              <p className="text-gray-600 max-w-2xl">{(community as any)?.description || "No description"}</p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </>
                )}
              </Button>
              <Button>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Members</p>
                  <p className="text-2xl font-bold">{(community as any)?.member_count || 1}</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New This Week</p>
                  <p className="text-2xl font-bold">{(stats as any)?.newMembersThisWeek || 0}</p>
                </div>
                <UserPlus className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                  <p className="text-2xl font-bold">{(stats as any)?.engagementRate || "85"}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Today</p>
                  <p className="text-2xl font-bold">{(stats as any)?.activeToday || 0}</p>
                </div>
                <Activity className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full mb-8">
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
              <Card>
                <CardHeader>
                  <CardTitle>Community Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(community as any)?.settings?.features ? (
                      Object.entries((community as any).settings.features).map(([feature, enabled]) => (
                        <div key={feature} className="flex items-center justify-between">
                          <span className="capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <Badge variant={enabled ? "default" : "secondary"}>
                            {enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No specific features configured</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Community Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(community as any)?.settings?.goals && (community as any).settings.goals.length > 0 ? (
                      (community as any).settings.goals.map((goal: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{goal}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No goals set yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Membership Tiers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(community as any)?.settings?.membershipTiers ? (
                      Object.entries((community as any).settings.membershipTiers).map(([tier, config]: [string, any]) => (
                        config.enabled && (
                          <div key={tier} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium capitalize">{tier}</h4>
                              <Badge variant="outline">
                                {config.price ? `$${config.price}/month` : "Free"}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{config.description}</p>
                          </div>
                        )
                      ))
                    ) : (
                      <p className="text-gray-500">No membership tiers configured</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Community Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(community as any)?.settings?.rules && (community as any).settings.rules.length > 0 ? (
                      (community as any).settings.rules.map((rule: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-sm text-purple-600 font-medium mt-0.5">{index + 1}.</span>
                          <span className="text-sm">{rule}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No rules set yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Member Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Member management coming soon</h3>
                  <p className="text-gray-600">You'll be able to view, manage, and interact with your community members here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Content management coming soon</h3>
                  <p className="text-gray-600">Create and manage posts, discussions, and community content here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monetization Tab */}
          <TabsContent value="monetization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue & Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Monetization dashboard coming soon</h3>
                  <p className="text-gray-600">Track your revenue, manage subscriptions, and view financial analytics here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {isEditing ? (
              <Card>
                <CardHeader>
                  <CardTitle>Edit Community Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="edit-name">Community Name</Label>
                      <Input
                        id="edit-name"
                        defaultValue={(community as any)?.name || ""}
                        placeholder="Enter community name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-description">Description</Label>
                      <Textarea
                        id="edit-description"
                        defaultValue={(community as any)?.description || ""}
                        placeholder="Describe your community"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="public-community"
                        defaultChecked={(community as any)?.is_public || false}
                      />
                      <Label htmlFor="public-community">Make community public</Label>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => updateCommunity.mutate({})}
                        disabled={updateCommunity.isPending}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {updateCommunity.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Community Settings</CardTitle>
                </CardHeader>
                <CardContent>
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
                    
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="mt-4"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}