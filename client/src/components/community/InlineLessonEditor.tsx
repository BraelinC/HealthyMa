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
import { SkoolStyleLesson } from "./SkoolStyleLesson";

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
  // If not a creator, show Skool-style lesson view
  if (!isCreator) {
    return (
      <SkoolStyleLesson 
        lesson={lesson}
        onBack={onClose}
        onNext={() => {}} // TODO: Implement next lesson navigation
      />
    );
  }

  // Creator editing state
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
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

  // Interactive feature toggles
  const [interactiveFeatures, setInteractiveFeatures] = useState({
    comments_enabled: lesson?.comments_enabled || false,
    poll_enabled: lesson?.poll_enabled || false,
    notes_enabled: lesson?.notes_enabled || false,
    timer_enabled: lesson?.timer_enabled || false,
    image_enabled: lesson?.image_enabled || false,
    video_enabled: lesson?.video_enabled || false,
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
    const dataToSave = {
      ...lessonData,
      ...interactiveFeatures
    };
    saveLessonMutation.mutate(dataToSave);
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
              <>
                <Button 
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  variant={isPreviewMode ? "default" : "outline"}
                  className={isPreviewMode 
                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                    : "border-gray-600 text-gray-300 hover:bg-gray-700"
                  }
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isPreviewMode ? "Exit Preview" : "Student View"}
                </Button>
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Edit Lesson
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        {isPreviewMode ? (
          /* Skool-Style Student Preview */
          <div className="border-2 border-blue-500 rounded-lg overflow-hidden">
            <div className="bg-blue-600 text-white p-2 text-center text-sm font-medium">
              Student View Preview
            </div>
            <SkoolStyleLesson 
              lesson={{...lessonData, ...interactiveFeatures, id: lesson?.id}}
              onBack={() => setIsPreviewMode(false)}
              onNext={() => {}}
            />
          </div>
        ) : isEditing ? (
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
                          className={`px-3 py-2 ${
                            interactiveFeatures.comments_enabled 
                              ? "text-purple-400 bg-purple-900/30 border border-purple-500/50" 
                              : "text-gray-400 hover:text-white hover:bg-gray-700"
                          }`}
                          onClick={() => {
                            setInteractiveFeatures({
                              ...interactiveFeatures,
                              comments_enabled: !interactiveFeatures.comments_enabled
                            });
                          }}
                        >
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Comments {interactiveFeatures.comments_enabled && "✓"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`px-3 py-2 ${
                            interactiveFeatures.poll_enabled 
                              ? "text-purple-400 bg-purple-900/30 border border-purple-500/50" 
                              : "text-gray-400 hover:text-white hover:bg-gray-700"
                          }`}
                          onClick={() => {
                            setInteractiveFeatures({
                              ...interactiveFeatures,
                              poll_enabled: !interactiveFeatures.poll_enabled
                            });
                          }}
                        >
                          <BarChart3 className="w-3 h-3 mr-1" />
                          Poll {interactiveFeatures.poll_enabled && "✓"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`px-3 py-2 ${
                            interactiveFeatures.notes_enabled 
                              ? "text-purple-400 bg-purple-900/30 border border-purple-500/50" 
                              : "text-gray-400 hover:text-white hover:bg-gray-700"
                          }`}
                          onClick={() => {
                            setInteractiveFeatures({
                              ...interactiveFeatures,
                              notes_enabled: !interactiveFeatures.notes_enabled
                            });
                          }}
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          Notes {interactiveFeatures.notes_enabled && "✓"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`px-3 py-2 ${
                            interactiveFeatures.timer_enabled 
                              ? "text-purple-400 bg-purple-900/30 border border-purple-500/50" 
                              : "text-gray-400 hover:text-white hover:bg-gray-700"
                          }`}
                          onClick={() => {
                            setInteractiveFeatures({
                              ...interactiveFeatures,
                              timer_enabled: !interactiveFeatures.timer_enabled
                            });
                          }}
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          Timer {interactiveFeatures.timer_enabled && "✓"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`px-3 py-2 ${
                            interactiveFeatures.image_enabled 
                              ? "text-purple-400 bg-purple-900/30 border border-purple-500/50" 
                              : "text-gray-400 hover:text-white hover:bg-gray-700"
                          }`}
                          onClick={() => {
                            setInteractiveFeatures({
                              ...interactiveFeatures,
                              image_enabled: !interactiveFeatures.image_enabled
                            });
                          }}
                        >
                          <Image className="w-3 h-3 mr-1" />
                          Image {interactiveFeatures.image_enabled && "✓"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`px-3 py-2 ${
                            interactiveFeatures.video_enabled 
                              ? "text-purple-400 bg-purple-900/30 border border-purple-500/50" 
                              : "text-gray-400 hover:text-white hover:bg-gray-700"
                          }`}
                          onClick={() => {
                            setInteractiveFeatures({
                              ...interactiveFeatures,
                              video_enabled: !interactiveFeatures.video_enabled
                            });
                          }}
                        >
                          <Video className="w-3 h-3 mr-1" />
                          Video {interactiveFeatures.video_enabled && "✓"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Preview of Enabled Features */}
                  {(interactiveFeatures.comments_enabled || interactiveFeatures.poll_enabled || interactiveFeatures.notes_enabled || interactiveFeatures.timer_enabled || interactiveFeatures.image_enabled || interactiveFeatures.video_enabled) && (
                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4">
                        <h4 className="text-white font-medium mb-3">Enabled Interactive Features:</h4>
                        <div className="space-y-2">
                          {interactiveFeatures.comments_enabled && (
                            <div className="flex items-center gap-2 text-sm text-purple-300">
                              <MessageCircle className="w-3 h-3" />
                              <span>Comments & Discussion</span>
                            </div>
                          )}
                          {interactiveFeatures.poll_enabled && (
                            <div className="flex items-center gap-2 text-sm text-purple-300">
                              <BarChart3 className="w-3 h-3" />
                              <span>Interactive Polls</span>
                            </div>
                          )}
                          {interactiveFeatures.notes_enabled && (
                            <div className="flex items-center gap-2 text-sm text-purple-300">
                              <FileText className="w-3 h-3" />
                              <span>Student Notes</span>
                            </div>
                          )}
                          {interactiveFeatures.timer_enabled && (
                            <div className="flex items-center gap-2 text-sm text-purple-300">
                              <Clock className="w-3 h-3" />
                              <span>Timer Activities</span>
                            </div>
                          )}
                          {interactiveFeatures.image_enabled && (
                            <div className="flex items-center gap-2 text-sm text-purple-300">
                              <Image className="w-3 h-3" />
                              <span>Image Sharing</span>
                            </div>
                          )}
                          {interactiveFeatures.video_enabled && (
                            <div className="flex items-center gap-2 text-sm text-purple-300">
                              <Video className="w-3 h-3" />
                              <span>Video Content</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
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

                {/* Interactive Features Section */}
                <div className="mt-6 space-y-4">
                  {interactiveFeatures.comments_enabled && (
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageCircle className="w-4 h-4 text-purple-400" />
                        <h4 className="text-white font-medium">Discussion</h4>
                      </div>
                      <p className="text-gray-300 text-sm">Comments are enabled for this lesson. Students can share their thoughts and ask questions.</p>
                    </div>
                  )}
                  
                  {interactiveFeatures.poll_enabled && (
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <BarChart3 className="w-4 h-4 text-purple-400" />
                        <h4 className="text-white font-medium">Poll</h4>
                      </div>
                      <p className="text-gray-300 text-sm">Interactive poll is available for student engagement.</p>
                    </div>
                  )}
                  
                  {interactiveFeatures.notes_enabled && (
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-4 h-4 text-purple-400" />
                        <h4 className="text-white font-medium">Notes</h4>
                      </div>
                      <p className="text-gray-300 text-sm">Students can take and save notes for this lesson.</p>
                    </div>
                  )}
                  
                  {interactiveFeatures.timer_enabled && (
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <h4 className="text-white font-medium">Timer</h4>
                      </div>
                      <p className="text-gray-300 text-sm">Built-in timer functionality is available for timed activities.</p>
                    </div>
                  )}
                  
                  {interactiveFeatures.image_enabled && (
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Image className="w-4 h-4 text-purple-400" />
                        <h4 className="text-white font-medium">Image Upload</h4>
                      </div>
                      <p className="text-gray-300 text-sm">Students can upload and share images related to this lesson.</p>
                    </div>
                  )}
                  
                  {interactiveFeatures.video_enabled && (
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Video className="w-4 h-4 text-purple-400" />
                        <h4 className="text-white font-medium">Video Content</h4>
                      </div>
                      <p className="text-gray-300 text-sm">Video sharing and discussion features are enabled for this lesson.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}