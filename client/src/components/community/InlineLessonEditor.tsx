import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Save,
  ChevronLeft,
  Target,
  ListChecks,
  Info,
  Play,
  MessageCircle,
  BarChart3,
  FileText,
  Image,
  Video,
  Clock,
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
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl">{lesson?.emoji || '📝'}</span>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white">{lesson?.title || "Lesson"}</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {lesson?.prep_time && lesson?.cook_time
                      ? `${lesson.prep_time + lesson.cook_time} minutes`
                      : 'Quick lesson'
                    }
                  </p>
                </div>
              </div>

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

              {lesson?.description && (
                <div className="prose prose-sm prose-invert max-w-none">
                  <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {lesson.description.split('\n').map((line: string, index: number) => {
                      if (line.startsWith('##')) {
                        return <h3 key={index} className="text-white font-semibold mt-6 mb-3 text-xl">{line.replace('##', '').trim()}</h3>;
                      }
                      if (line.startsWith('•')) {
                        return <li key={index} className="ml-6 list-disc mb-1">{line.replace('•', '').trim()}</li>;
                      }
                      if (line.match(/^\d+\./)) {
                        return <li key={index} className="ml-6 list-decimal mb-1">{line.replace(/^\d+\./, '').trim()}</li>;
                      }
                      if (line.startsWith('---')) {
                        return <hr key={index} className="my-6 border-gray-600" />;
                      }
                      if (line.trim()) {
                        return <p key={index} className="mb-3">{line}</p>;
                      }
                      return <br key={index} />;
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Creator editing state
  const [isEditing, setIsEditing] = useState(false);
  const [lessonData, setLessonData] = useState({
    title: lesson?.title || "",
    description: lesson?.description || "",
    emoji: lesson?.emoji || "📝",
    prep_time: lesson?.prep_time || 0,
    cook_time: lesson?.cook_time || 0,
    servings: lesson?.servings || 4,
    difficulty_level: lesson?.difficulty_level || 1,
    youtube_video_id: lesson?.youtube_video_id || "",
  });

  const [youtubeUrl, setYoutubeUrl] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Extract YouTube video ID from URL
  const handleYouTubeUrl = (url: string) => {
    setYoutubeUrl(url);
    const videoId = extractYouTubeVideoId(url);
    if (videoId) {
      setLessonData({ ...lessonData, youtube_video_id: videoId });
    }
  };

  const extractYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Save lesson mutation
  const saveLessonMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/communities/${communityId}/courses/${courseId}/lessons/${lesson.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "✅ Lesson saved",
        description: "Your changes have been saved successfully.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({
        queryKey: [`/api/communities/${communityId}/courses/${courseId}/lessons`],
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Error saving lesson",
        description: "Failed to save your changes. Please try again.",
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
      <div className="bg-gray-800 border-b border-gray-700 p-4 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <Button 
              onClick={onClose}
              variant="ghost" 
              className="text-gray-400 hover:text-white p-2"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{lessonData.emoji}</span>
              <div>
                <h1 className="text-xl font-bold text-white">{lessonData.title || "Untitled Lesson"}</h1>
                <p className="text-sm text-gray-400">
                  {isEditing ? "Editing" : "Viewing"} • Course Lesson
                </p>
              </div>
            </div>
            {lesson?.is_published && (
              <Badge variant="outline" className="border-green-500 text-green-400 ml-4">
                Published
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <Button 
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={saveLessonMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saveLessonMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => setIsEditing(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Edit Lesson
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        {isEditing ? (
          /* Creator Editing Layout */
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Lesson Details */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  📝 Lesson Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Lesson Title</Label>
                    <Input
                      value={lessonData.title}
                      onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })}
                      placeholder="Enter lesson title"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Emoji</Label>
                    <Input
                      value={lessonData.emoji}
                      onChange={(e) => setLessonData({ ...lessonData, emoji: e.target.value })}
                      placeholder="📝"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>

                {/* Content Section - Box 1: Simple Content Area */}
                <div className="space-y-4">
                  {/* Box 1: Content Input */}
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                      <Textarea
                        value={lessonData.description}
                        onChange={(e) => setLessonData({ ...lessonData, description: e.target.value })}
                        placeholder="Write your lesson content here..."
                        className="bg-gray-700 border-gray-600 text-white min-h-[200px] resize-none"
                        rows={8}
                      />
                    </CardContent>
                  </Card>

                  {/* Box 2: Quick Add Buttons */}
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white hover:bg-gray-700 px-3 py-2"
                          onClick={() => {
                            const currentContent = lessonData.description;
                            setLessonData({
                              ...lessonData,
                              description: currentContent + "\n\n## Key Points\n• \n• \n• \n"
                            });
                          }}
                        >
                          <Target className="w-3 h-3 mr-1" />
                          Key Points
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white hover:bg-gray-700 px-3 py-2"
                          onClick={() => {
                            const currentContent = lessonData.description;
                            setLessonData({
                              ...lessonData,
                              description: currentContent + "\n\n## Steps\n1. \n2. \n3. \n"
                            });
                          }}
                        >
                          <ListChecks className="w-3 h-3 mr-1" />
                          Steps
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white hover:bg-gray-700 px-3 py-2"
                          onClick={() => {
                            const currentContent = lessonData.description;
                            setLessonData({
                              ...lessonData,
                              description: currentContent + "\n\n💡 **Pro Tip:** \n\n"
                            });
                          }}
                        >
                          <Info className="w-3 h-3 mr-1" />
                          Tip
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white hover:bg-gray-700 px-3 py-2"
                          onClick={() => {
                            const currentContent = lessonData.description;
                            setLessonData({
                              ...lessonData,
                              description: currentContent + "\n\n## Discussion\n💬 What are your thoughts on this lesson?\n\n"
                            });
                          }}
                        >
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Comments
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white hover:bg-gray-700 px-3 py-2"
                          onClick={() => {
                            const currentContent = lessonData.description;
                            setLessonData({
                              ...lessonData,
                              description: currentContent + "\n\n## Quick Poll\n📊 Which option do you prefer?\n• Option A\n• Option B\n• Option C\n\n"
                            });
                          }}
                        >
                          <BarChart3 className="w-3 h-3 mr-1" />
                          Poll
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white hover:bg-gray-700 px-3 py-2"
                          onClick={() => {
                            const currentContent = lessonData.description;
                            setLessonData({
                              ...lessonData,
                              description: currentContent + "\n\n## Notes\n📝 Important reminders:\n• \n• \n\n"
                            });
                          }}
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          Notes
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white hover:bg-gray-700 px-3 py-2"
                          onClick={() => {
                            const currentContent = lessonData.description;
                            setLessonData({
                              ...lessonData,
                              description: currentContent + "\n\n## Timer\n⏰ Set a timer for: ___ minutes\n\n"
                            });
                          }}
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          Timer
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white hover:bg-gray-700 px-3 py-2"
                          onClick={() => {
                            const currentContent = lessonData.description;
                            setLessonData({
                              ...lessonData,
                              description: currentContent + "\n\n## Image Placeholder\n🖼️ [Add image here]\n\n"
                            });
                          }}
                        >
                          <Image className="w-3 h-3 mr-1" />
                          Image
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white hover:bg-gray-700 px-3 py-2"
                          onClick={() => {
                            const currentContent = lessonData.description;
                            setLessonData({
                              ...lessonData,
                              description: currentContent + "\n\n## Video\n🎥 [Video URL: ]\n\n"
                            });
                          }}
                        >
                          <Video className="w-3 h-3 mr-1" />
                          Video
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Student View Layout */
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">{lessonData.emoji}</span>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white">{lessonData.title}</h2>
                    <p className="text-gray-400 text-sm mt-1">
                      {lessonData.prep_time && lessonData.cook_time
                        ? `${lessonData.prep_time + lessonData.cook_time} minutes`
                        : 'Quick lesson'
                      }
                    </p>
                  </div>
                </div>

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

                {lessonData.description && (
                  <div className="prose prose-sm prose-invert max-w-none">
                    <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {lessonData.description.split('\n').map((line: string, index: number) => {
                        if (line.startsWith('##')) {
                          return <h3 key={index} className="text-white font-semibold mt-6 mb-3 text-xl">{line.replace('##', '').trim()}</h3>;
                        }
                        if (line.startsWith('•')) {
                          return <li key={index} className="ml-6 list-disc mb-1">{line.replace('•', '').trim()}</li>;
                        }
                        if (line.match(/^\d+\./)) {
                          return <li key={index} className="ml-6 list-decimal mb-1">{line.replace(/^\d+\./, '').trim()}</li>;
                        }
                        if (line.startsWith('---')) {
                          return <hr key={index} className="my-6 border-gray-600" />;
                        }
                        if (line.trim()) {
                          return <p key={index} className="mb-3">{line}</p>;
                        }
                        return <br key={index} />;
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}