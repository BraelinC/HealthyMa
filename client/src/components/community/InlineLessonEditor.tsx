import { useState, useEffect, useRef } from "react";
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
  Upload,
  X,
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

              {lesson?.image_url && (
                <div className="mb-6">
                  <img 
                    src={lesson.image_url} 
                    alt="Lesson" 
                    className="w-full h-48 object-cover rounded-lg border border-gray-600"
                  />
                </div>
              )}

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
    servings: lesson?.servings || 4,
    difficulty_level: lesson?.difficulty_level || 1,
    youtube_video_id: lesson?.youtube_video_id || "",
    image_url: lesson?.image_url || "",
  });

  // Image upload state
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Section toggles for lesson components
  const [sectionToggles, setSectionToggles] = useState({
    image_enabled: !!(lesson?.image_url),
    video_enabled: !!(lesson?.youtube_video_id),
    content_enabled: true, // Always start with content enabled
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

  // Image upload functionality
  const uploadImage = async (file: File): Promise<string> => {
    try {
      // Get upload URL from backend
      const response = await fetch('/api/objects/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadURL } = await response.json();

      // Upload file directly to object storage
      const uploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      // Return the object path that can be accessed via our server
      const url = new URL(uploadURL);
      const objectPath = url.pathname;
      const objectId = objectPath.split('/').pop()?.split('?')[0];
      
      const serverPath = `/objects/uploads/${objectId}`;
      console.log('Upload successful. Server path:', serverPath);
      return serverPath;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0]; // Only take the first file for lesson image
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select only image files.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select images smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const imageUrl = await uploadImage(file);
      setLessonData({ ...lessonData, image_url: imageUrl });
      
      toast({
        title: "Image uploaded",
        description: "Lesson image uploaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setLessonData({ ...lessonData, image_url: "" });
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
          /* Simplified Creator Editing with Section Toggles */
          <div className="max-w-2xl mx-auto space-y-6">
            
            
            {/* 1. Image Import at Top */}
            <Card className="bg-gray-800 border-gray-700 relative">
              {/* Toggle button in corner */}
              <Button
                variant="ghost"
                size="sm"
                className={`absolute top-2 right-2 z-10 p-2 ${
                  sectionToggles.image_enabled 
                    ? "text-purple-400 bg-purple-900/50" 
                    : "text-gray-400 bg-gray-700/50"
                }`}
                onClick={() => {
                  setSectionToggles({
                    ...sectionToggles,
                    image_enabled: !sectionToggles.image_enabled
                  });
                }}
              >
                <Image className="w-4 h-4" />
              </Button>
              <CardContent className={`p-6 transition-opacity duration-200 ${
                sectionToggles.image_enabled ? 'opacity-100' : 'opacity-30'
              }`}>
                <div className="text-center space-y-4">
                  {lessonData.image_url ? (
                    <div className="relative w-full h-48 bg-gray-700 rounded-lg overflow-hidden">
                      <img 
                        src={lessonData.image_url} 
                        alt="Lesson" 
                        className="w-full h-full object-cover"
                      />
                      <Button 
                        variant="destructive"
                        size="sm"
                        onClick={removeImage}
                        className="absolute top-2 right-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="w-full h-48 bg-gray-700 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center hover:border-gray-500 transition-colors cursor-pointer"
                      onClick={openFileSelector}
                    >
                      <div className="text-center">
                        <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-400 mb-3 text-sm">Import lesson image</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={uploading}
                          className="bg-gray-600 border-gray-500 hover:bg-gray-500 text-white"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {uploading ? "Uploading..." : "Upload Image"}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 2. YouTube Video Section */}
            <Card className="bg-gray-800 border-gray-700 relative">
              {/* Toggle button in corner */}
              <Button
                variant="ghost"
                size="sm"
                className={`absolute top-2 right-2 z-10 p-2 ${
                  sectionToggles.video_enabled 
                    ? "text-purple-400 bg-purple-900/50" 
                    : "text-gray-400 bg-gray-700/50"
                }`}
                onClick={() => {
                  setSectionToggles({
                    ...sectionToggles,
                    video_enabled: !sectionToggles.video_enabled
                  });
                }}
              >
                <Video className="w-4 h-4" />
              </Button>
              <CardContent className={`p-6 space-y-4 transition-opacity duration-200 ${
                sectionToggles.video_enabled ? 'opacity-100' : 'opacity-30'
              }`}>
                {/* YouTube URL */}
                <input
                  type="text"
                  placeholder="YouTube URL (optional) - https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => handleYouTubeUrl(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-purple-500 focus:outline-none placeholder-gray-400"
                />
                
                {/* YouTube Video Preview */}
                {lessonData.youtube_video_id && (
                  <div className="space-y-2">
                    <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden border border-gray-600">
                      <iframe
                        src={`https://www.youtube.com/embed/${lessonData.youtube_video_id}`}
                        title="YouTube video preview"
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <p className="text-xs text-gray-400">Video will be embedded in your lesson</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 3. Simple Content Box */}
            <Card className="bg-gray-800 border-gray-700 relative">
              {/* Toggle button in corner */}
              <Button
                variant="ghost"
                size="sm"
                className={`absolute top-2 right-2 z-10 p-2 ${
                  sectionToggles.content_enabled 
                    ? "text-purple-400 bg-purple-900/50" 
                    : "text-gray-400 bg-gray-700/50"
                }`}
                onClick={() => {
                  setSectionToggles({
                    ...sectionToggles,
                    content_enabled: !sectionToggles.content_enabled
                  });
                }}
              >
                <FileText className="w-4 h-4" />
              </Button>
              <CardContent className={`p-6 space-y-4 transition-opacity duration-200 ${
                sectionToggles.content_enabled ? 'opacity-100' : 'opacity-30'
              }`}>
                {/* Title */}
                <input
                  type="text"
                  placeholder="Lesson Title"
                  value={lessonData.title}
                  onChange={(e) => setLessonData({...lessonData, title: e.target.value})}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-purple-500 focus:outline-none text-xl font-medium placeholder-gray-400"
                />
                
                {/* Content */}
                <textarea
                  placeholder="Write your lesson content here..."
                  value={lessonData.description}
                  onChange={(e) => setLessonData({...lessonData, description: e.target.value})}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-4 border border-gray-600 focus:border-purple-500 focus:outline-none resize-none placeholder-gray-400"
                  rows={12}
                />
              </CardContent>
            </Card>

          </div>
        ) : (
          /* Student View Layout */
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white">{lessonData.title}</h2>
                  </div>
                </div>

                {lessonData.image_url && (
                  <div className="mb-6">
                    <img 
                      src={lessonData.image_url} 
                      alt="Lesson" 
                      className="w-full h-48 object-cover rounded-lg border border-gray-600"
                    />
                  </div>
                )}

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