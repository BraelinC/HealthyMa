import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Save,
  ChevronLeft,
  Youtube,
  ChefHat,
  Settings,
  FileText,
  Target,
  ListChecks,
  Info,
  Plus,
  Play,
  MessageCircle,
  BarChart3,
  ShoppingCart,
  Users,
  Heart,
  Clock,
  Eye,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface InlineLessonEditorProps {
  lesson: any;
  communityId: string;
  courseId: number;
  isCreator: boolean;
  onClose: () => void;
}

export default function InlineLessonEditor({ 
  lesson, 
  communityId, 
  courseId, 
  isCreator, 
  onClose 
}: InlineLessonEditorProps) {
  // If not a creator, show simple student view
  if (!isCreator) {
    return (
      <div className="bg-gray-900 min-h-screen">
        {/* Simple Student Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <Button 
                onClick={onClose}
                variant="ghost" 
                className="text-gray-400 hover:text-white p-2"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{lesson?.emoji || '📝'}</span>
                <div>
                  <h1 className="text-xl font-bold text-white">{lesson?.title || "Lesson"}</h1>
                  <p className="text-sm text-gray-400">Course Lesson</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Student Lesson Content */}
        <div className="max-w-4xl mx-auto p-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              {/* Video Section */}
              {lesson?.youtube_video_id && (
                <div className="mb-6">
                  <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden border border-gray-600">
                    <iframe
                      src={`https://www.youtube.com/embed/${lesson.youtube_video_id}`}
                      title="Lesson video"
                      className="w-full h-full"
                      frameBorder="0"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* Lesson Content */}
              {lesson?.description && (
                <div className="prose prose-lg prose-invert max-w-none">
                  <div className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {lesson.description.split('\n').map((line: string, index: number) => {
                      if (line.startsWith('##')) {
                        return <h3 key={index} className="text-white font-semibold mt-6 mb-3 text-xl">{line.replace('##', '').trim()}</h3>;
                      }
                      if (line.startsWith('•')) {
                        return <li key={index} className="ml-6 list-disc text-base mb-1">{line.replace('•', '').trim()}</li>;
                      }
                      if (line.match(/^\d+\./)) {
                        return <li key={index} className="ml-6 list-decimal text-base mb-1">{line.replace(/^\d+\./, '').trim()}</li>;
                      }
                      if (line.startsWith('---')) {
                        return <hr key={index} className="my-6 border-gray-600" />;
                      }
                      if (line.trim()) {
                        return <p key={index} className="mb-3 text-base">{line}</p>;
                      }
                      return <br key={index} />;
                    })}
                  </div>
                </div>
              )}

              {/* Student Engagement Section */}
              <div className="mt-8 pt-6 border-t border-gray-700">
                <div className="flex items-center gap-4">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Start Discussion
                  </Button>
                  <Button variant="outline" className="border-gray-600 text-gray-300">
                    <Heart className="w-4 h-4 mr-2" />
                    Mark Complete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  const [lessonData, setLessonData] = useState({
    title: lesson?.title || '',
    emoji: lesson?.emoji || '🍳',
    description: lesson?.description || '',
    youtube_video_id: lesson?.youtube_video_id || '',
    ingredients: lesson?.ingredients || [],
    instructions: lesson?.instructions || [],
    prep_time: lesson?.prep_time || 15,
    cook_time: lesson?.cook_time || 30,
    servings: lesson?.servings || 4,
    difficulty_level: lesson?.difficulty_level || 1,
    is_published: lesson?.is_published || false,
    lesson_order: lesson?.lesson_order || 1,
  });

  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [activeTab, setActiveTab] = useState('content');
  const [isEditing, setIsEditing] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Content toggles state
  const [contentToggles, setContentToggles] = useState([
    { id: 'comments', label: 'Comments', description: 'Allow student discussions', icon: MessageCircle, enabled: true },
    { id: 'polls', label: 'Polls', description: 'Interactive student polls', icon: BarChart3, enabled: false },
    { id: 'recipe', label: 'Recipe Card', description: 'Formatted recipe display', icon: ChefHat, enabled: true },
    { id: 'nutrition', label: 'Nutrition Info', description: 'Nutritional breakdown', icon: Heart, enabled: true },
    { id: 'shopping', label: 'Shopping List', description: 'Instacart integration', icon: ShoppingCart, enabled: true },
  ]);

  const toggleContent = (toggleId: string) => {
    setContentToggles(prev => 
      prev.map(toggle => 
        toggle.id === toggleId 
          ? { ...toggle, enabled: !toggle.enabled }
          : toggle
      )
    );
  };

  // YouTube URL handling
  const handleYouTubeUrl = (url: string) => {
    setYoutubeUrl(url);
    const videoId = extractYouTubeVideoId(url);
    if (videoId) {
      setLessonData(prev => ({ ...prev, youtube_video_id: videoId }));
    }
  };

  const extractYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Save lesson mutation
  const saveLessonMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/communities/${communityId}/courses/${courseId}/lessons/${lesson.id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Lesson updated successfully!",
        description: "Your changes have been saved.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/courses`] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save lesson",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveLessonMutation.mutate(lessonData);
  };

  return (
    <div className="bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <Button 
              onClick={onClose}
              variant="ghost" 
              className="text-gray-400 hover:text-white p-2"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">
                {lessonData.title || "Untitled Lesson"}
              </h1>
              <p className="text-sm text-gray-400">Course Lesson</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isCreator && (
              <>
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleSave}
                      disabled={saveLessonMutation.isPending}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saveLessonMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button onClick={() => setIsEditing(false)} variant="ghost" className="text-gray-400">
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="border-gray-600 text-gray-300"
                  >
                    Edit Lesson
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Creator Mode Indicator */}
      <div className="bg-purple-600/10 border-b border-purple-600/30 px-6 py-2">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm text-purple-400 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Creator Mode - Advanced Lesson Editor
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lesson Header */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">{lessonData.emoji}</span>
                  <div className="flex-1">
                    {isEditing ? (
                      <Input
                        value={lessonData.title}
                        onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })}
                        placeholder="Lesson title..."
                        className="bg-gray-700 border-gray-600 text-white text-xl font-bold"
                      />
                    ) : (
                      <h2 className="text-2xl font-bold text-white">{lessonData.title}</h2>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {lessonData.prep_time + lessonData.cook_time} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {lessonData.servings} servings
                      </span>
                      <Badge className={lessonData.is_published ? "bg-green-600" : "bg-gray-600"}>
                        {lessonData.is_published ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Video Section */}
                {lessonData.youtube_video_id && (
                  <div className="mb-6">
                    <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden border border-gray-600">
                      <iframe
                        src={`https://www.youtube.com/embed/${lessonData.youtube_video_id}`}
                        title="Lesson video"
                        className="w-full h-full"
                        frameBorder="0"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                {/* Content Section */}
                <div className="space-y-4">
                  {isEditing ? (
                    <div>
                      <Label className="text-gray-300 mb-2 block">Lesson Content</Label>
                      <Textarea
                        value={lessonData.description}
                        onChange={(e) => setLessonData({ ...lessonData, description: e.target.value })}
                        placeholder="Write your lesson content here... Add instructions, key points, explanations, etc."
                        className="bg-gray-700 border-gray-600 text-white min-h-[200px]"
                        rows={8}
                      />
                      <p className="text-xs text-gray-400 mt-1">Tip: Use clear headings, bullet points, and step-by-step instructions</p>
                      
                      {/* Quick Content Templates */}
                      <div className="mt-4">
                        <Label className="text-gray-300 mb-3 block">Quick Content Templates</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-700 justify-start h-auto p-3"
                            onClick={() => {
                              const currentContent = lessonData.description;
                              setLessonData({
                                ...lessonData,
                                description: currentContent + "\n\n## Key Points\n• \n• \n• \n"
                              });
                            }}
                          >
                            <div className="text-left">
                              <div className="flex items-center">
                                <Target className="w-4 h-4 mr-2" />
                                Key Points
                              </div>
                              <p className="text-xs text-gray-400 mt-1">Add bullet points</p>
                            </div>
                          </Button>
                          <Button
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-700 justify-start h-auto p-3"
                            onClick={() => {
                              const currentContent = lessonData.description;
                              setLessonData({
                                ...lessonData,
                                description: currentContent + "\n\n## Steps to Follow\n1. \n2. \n3. \n"
                              });
                            }}
                          >
                            <div className="text-left">
                              <div className="flex items-center">
                                <ListChecks className="w-4 h-4 mr-2" />
                                Step List
                              </div>
                              <p className="text-xs text-gray-400 mt-1">Numbered steps</p>
                            </div>
                          </Button>
                          <Button
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-700 justify-start h-auto p-3"
                            onClick={() => {
                              const currentContent = lessonData.description;
                              setLessonData({
                                ...lessonData,
                                description: currentContent + "\n\n## 💡 Pro Tip\n\n"
                              });
                            }}
                          >
                            <div className="text-left">
                              <div className="flex items-center">
                                <Info className="w-4 h-4 mr-2" />
                                Pro Tip
                              </div>
                              <p className="text-xs text-gray-400 mt-1">Important note</p>
                            </div>
                          </Button>
                          <Button
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-700 justify-start h-auto p-3"
                            onClick={() => {
                              const currentContent = lessonData.description;
                              setLessonData({
                                ...lessonData,
                                description: currentContent + "\n\n---\n\n## Next Section\n\n"
                              });
                            }}
                          >
                            <div className="text-left">
                              <div className="flex items-center">
                                <Plus className="w-4 h-4 mr-2" />
                                Section Break
                              </div>
                              <p className="text-xs text-gray-400 mt-1">Add separator</p>
                            </div>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    lessonData.description && (
                      <div className="prose prose-sm prose-invert max-w-none">
                        <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                          {lessonData.description.split('\n').map((line: string, index: number) => {
                            if (line.startsWith('##')) {
                              return <h3 key={index} className="text-white font-semibold mt-4 mb-2 text-lg">{line.replace('##', '').trim()}</h3>;
                            }
                            if (line.startsWith('•')) {
                              return <li key={index} className="ml-4 list-disc text-sm">{line.replace('•', '').trim()}</li>;
                            }
                            if (line.match(/^\d+\./)) {
                              return <li key={index} className="ml-4 list-decimal text-sm">{line.replace(/^\d+\./, '').trim()}</li>;
                            }
                            if (line.startsWith('---')) {
                              return <hr key={index} className="my-4 border-gray-600" />;
                            }
                            if (line.trim()) {
                              return <p key={index} className="mb-2 text-sm">{line}</p>;
                            }
                            return <br key={index} />;
                          })}
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* YouTube URL Input for Editing */}
                {isEditing && (
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <Label className="text-gray-300">YouTube Video URL</Label>
                    <Input
                      value={youtubeUrl}
                      onChange={(e) => handleYouTubeUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="bg-gray-700 border-gray-600 text-white mt-2"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Paste the full YouTube URL and we'll extract the video ID automatically
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Advanced Creator Controls */}
          <div className="space-y-4">
            {/* Live Preview */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Student View
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-xs text-gray-400">
                  How students will see this lesson
                </div>
                <div className="bg-gray-900 rounded-lg p-3 border border-gray-600">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{lessonData.emoji}</span>
                    <div>
                      <h4 className="font-medium text-white text-sm">{lessonData.title || "Untitled Lesson"}</h4>
                      <p className="text-xs text-gray-400">{lessonData.prep_time + lessonData.cook_time} min</p>
                    </div>
                  </div>
                  {lessonData.youtube_video_id && (
                    <div className="bg-gray-800 rounded h-16 mb-2 flex items-center justify-center">
                      <Play className="w-4 h-4 text-purple-400" />
                    </div>
                  )}
                  {lessonData.description && (
                    <p className="text-xs text-gray-300 line-clamp-3">{lessonData.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Advanced Lesson Settings */}
            {isEditing && (
              <>
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4" />
                      Lesson Timing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-gray-300 text-xs">Prep Time (min)</Label>
                        <Input
                          type="number"
                          value={lessonData.prep_time}
                          onChange={(e) => setLessonData({ ...lessonData, prep_time: parseInt(e.target.value) || 0 })}
                          className="bg-gray-700 border-gray-600 text-white h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300 text-xs">Cook Time (min)</Label>
                        <Input
                          type="number"
                          value={lessonData.cook_time}
                          onChange={(e) => setLessonData({ ...lessonData, cook_time: parseInt(e.target.value) || 0 })}
                          className="bg-gray-700 border-gray-600 text-white h-8"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-gray-300 text-xs">Servings</Label>
                        <Input
                          type="number"
                          value={lessonData.servings}
                          onChange={(e) => setLessonData({ ...lessonData, servings: parseInt(e.target.value) || 1 })}
                          className="bg-gray-700 border-gray-600 text-white h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300 text-xs">Difficulty (1-5)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          value={lessonData.difficulty_level}
                          onChange={(e) => setLessonData({ ...lessonData, difficulty_level: parseInt(e.target.value) || 1 })}
                          className="bg-gray-700 border-gray-600 text-white h-8"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2 text-sm">
                      <Settings className="w-4 h-4" />
                      Interactive Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {contentToggles.map((toggle) => (
                      <div key={toggle.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <toggle.icon className="w-3 h-3 text-purple-400" />
                          <div>
                            <Label className="text-white font-medium text-xs">{toggle.label}</Label>
                            <p className="text-xs text-gray-500">{toggle.description}</p>
                          </div>
                        </div>
                        <Switch
                          checked={toggle.enabled}
                          onCheckedChange={() => toggleContent(toggle.id)}
                          className="scale-75"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2 text-sm">
                      <Eye className="w-4 h-4" />
                      Publishing Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white font-medium text-xs">Published Status</Label>
                        <p className="text-xs text-gray-500">Make visible to students</p>
                      </div>
                      <Switch
                        checked={lessonData.is_published}
                        onCheckedChange={(checked) => setLessonData({ ...lessonData, is_published: checked })}
                        className="scale-75"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300 text-xs">Lesson Order</Label>
                      <Input
                        type="number"
                        value={lessonData.lesson_order}
                        onChange={(e) => setLessonData({ ...lessonData, lesson_order: parseInt(e.target.value) || 1 })}
                        className="bg-gray-700 border-gray-600 text-white h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300 text-xs">Emoji</Label>
                      <Input
                        value={lessonData.emoji}
                        onChange={(e) => setLessonData({ ...lessonData, emoji: e.target.value })}
                        placeholder="🍳"
                        className="bg-gray-700 border-gray-600 text-white h-8"
                        maxLength={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Active Features Display */}
            {!isEditing && contentToggles.some(t => t.enabled) && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Available Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {contentToggles.filter(t => t.enabled).map((toggle) => (
                      <div key={toggle.id} className="flex items-center gap-1 bg-purple-600/20 px-2 py-1 rounded text-xs text-purple-400">
                        <toggle.icon className="w-3 h-3" />
                        <span>{toggle.label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}