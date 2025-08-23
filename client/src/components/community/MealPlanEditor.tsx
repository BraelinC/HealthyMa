import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Save,
  ChefHat,
  Clock,
  Users,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Copy,
  Settings,
  BookOpen,
  Play,
  FileText,
  Target,
  ListChecks,
  Info,
  X,
  Menu,
  ChevronLeft,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

interface Course {
  id: number;
  title: string;
  emoji?: string;
  description?: string;
  category?: string;
  lesson_count: number;
  is_published: boolean;
  display_order: number;
  modules?: Module[];
}

interface Module {
  id: number;
  course_id: number;
  title: string;
  emoji?: string;
  description?: string;
  module_order: number;
  is_expanded: boolean;
  lessons?: Lesson[];
}

interface Lesson {
  id: number;
  course_id: number;
  module_id?: number;
  title: string;
  emoji?: string;
  description?: string;
  video_url?: string;
  youtube_video_id?: string;
  ingredients: string[];
  instructions: string[];
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty_level: number;
  lesson_order: number;
  is_published: boolean;
  sections?: LessonSection[];
}

interface LessonSection {
  id?: number;
  section_type: "about" | "key_takeaways" | "action_steps" | "custom";
  title: string;
  content: string;
  template_id?: string;
  display_order: number;
}

interface MealPlanEditorProps {
  communityId: string;
  onClose?: () => void;
}

// Template options for "About This Lesson" sections
const SECTION_TEMPLATES = [
  { id: "meal_prep", label: "Meal Prep Strategy", icon: ChefHat },
  { id: "shopping_guide", label: "Shopping Guide", icon: Users },
  { id: "techniques", label: "Cooking Techniques", icon: BookOpen },
  { id: "nutrition", label: "Nutritional Benefits", icon: Target },
  { id: "time_management", label: "Time-Saving Tips", icon: Clock },
  { id: "cultural", label: "Cultural Context", icon: Info },
  { id: "custom", label: "Custom", icon: FileText },
];

// Emoji options for courses and lessons
const EMOJI_OPTIONS = ["🌟", "🔥", "💰", "📚", "🥗", "🍽️", "👨‍🍳", "🎯", "💪", "🏆", "🚀", "✨", "🌮", "🍝", "🍜", "🍱"];

export function MealPlanEditor({ communityId, onClose }: MealPlanEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [isCreatingLesson, setIsCreatingLesson] = useState(false);

  console.log('MealPlanEditor mounted with communityId:', communityId);

  // Fetch courses for this community
  const { data: courses = [], isLoading, error } = useQuery({
    queryKey: [`/api/communities/${communityId}/courses`],
    queryFn: async () => {
      console.log('Fetching courses for community:', communityId);
      const token = localStorage.getItem('auth_token');
      console.log('Auth token exists:', !!token);
      
      const response = await fetch(`/api/communities/${communityId}/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('Courses fetch response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch courses:', errorText);
        throw new Error(`Failed to fetch courses: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Fetched courses:', data);
      // Ensure we always return an array
      return Array.isArray(data) ? data : [];
    },
    enabled: !!communityId,
  });

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: async (data: Partial<Course>) => {
      console.log('Sending create course request:', data);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`/api/communities/${communityId}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      const responseText = await response.text();
      console.log('Create course response:', response.status, responseText);
      
      if (!response.ok) {
        let errorMessage = 'Failed to create course';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      return JSON.parse(responseText);
    },
    onSuccess: (data) => {
      console.log('Course created successfully:', data);
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/courses`] });
      toast({ title: "Course created", description: "Your new course has been created successfully." });
      setIsCreatingCourse(false);
    },
    onError: (error) => {
      console.error('Error creating course:', error);
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to create course",
        variant: "destructive"
      });
    },
  });

  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: async ({ courseId, data }: { courseId: number; data: Partial<Course> }) => {
      const response = await fetch(`/api/communities/${communityId}/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update course');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/courses`] });
      toast({ title: "Course updated", description: "Your course has been updated successfully." });
    },
  });

  // Delete course mutation
  const deleteCourseMutation = useMutation({
    mutationFn: async (courseId: number) => {
      const response = await fetch(`/api/communities/${communityId}/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete course');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/courses`] });
      toast({ title: "Course deleted", description: "The course has been deleted successfully." });
      setSelectedCourse(null);
    },
  });

  // Handle drag and drop for course ordering
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(courses);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update display_order for all affected courses
    items.forEach((course, index) => {
      if (course.display_order !== index) {
        updateCourseMutation.mutate({
          courseId: course.id,
          data: { display_order: index },
        });
      }
    });
  };

  const toggleModuleExpansion = (moduleId: number) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[10000]" data-meal-plan-editor>
      <div className="fixed inset-0 bg-gray-900 flex relative"
           onClick={(e) => {
             // Close sidebar when clicking on overlay area (only on mobile)
             if (window.innerWidth <= 768 && e.target === e.currentTarget) {
               const editor = document.querySelector('[data-meal-plan-editor]');
               if (editor && !editor.classList.contains('sidebar-collapsed')) {
                 editor.classList.add('sidebar-collapsed');
               }
             }
           }}>
        {/* Left Sidebar - Course List */}
        <div className="w-80 min-h-screen bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white mb-4">Meal Plan Courses</h2>
          <Button
            onClick={() => setIsCreatingCourse(true)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Course
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading courses...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-400">Error loading courses</p>
            <p className="text-gray-400 text-sm mt-1">{error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-8">
            <ChefHat className="h-12 w-12 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400">No courses yet</p>
            <p className="text-gray-500 text-sm mt-1">Create your first course to get started</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="courses">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {(courses as Course[]).map((course: Course, index: number) => (
                  <Draggable key={course.id} draggableId={`course-${course.id}`} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${
                          snapshot.isDragging ? 'opacity-50' : ''
                        } ${
                          selectedCourse?.id === course.id ? 'bg-gray-800' : ''
                        }`}
                      >
                        <Card
                          className="bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors"
                          onClick={() => setSelectedCourse(course)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2 flex-1">
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="h-4 w-4 text-gray-400" />
                                </div>
                                <span className="text-lg">{course.emoji || '📚'}</span>
                                <div className="flex-1">
                                  <h3 className="font-medium text-white text-sm">{course.title}</h3>
                                  <p className="text-xs text-gray-400">{course.lesson_count} lessons</p>
                                </div>
                              </div>
                              <Badge
                                className={`text-xs ${
                                  course.is_published
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-600 text-gray-300'
                                }`}
                              >
                                {course.is_published ? 'Published' : 'Draft'}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

        {/* Main Content Area */}
        <div className="flex-1 min-h-screen p-6 overflow-y-auto bg-gray-900">
        {selectedCourse ? (
          <CourseEditor
            course={selectedCourse}
            communityId={communityId}
            onUpdate={(data) => updateCourseMutation.mutate({ courseId: selectedCourse.id, data })}
            onDelete={() => deleteCourseMutation.mutate(selectedCourse.id)}
            onSelectLesson={setSelectedLesson}
          />
        ) : (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <ChefHat className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Select a Course</h3>
              <p className="text-gray-400">Choose a course from the sidebar or create a new one to get started</p>
            </div>
          </div>
        )}
      </div>

        {/* Toggle Sidebar Button */}
        <Button
          onClick={() => {
            // Toggle sidebar collapse state
            const editor = document.querySelector('[data-meal-plan-editor]');
            if (editor) {
              editor.classList.toggle('sidebar-collapsed');
            }
            // Only close on desktop when explicitly requested
            if (window.innerWidth >= 768 && onClose) {
              onClose();
            }
          }}
          className="absolute top-4 left-4 z-30 bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
          size="sm"
          title="Toggle course list"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Create Course Dialog */}
        <Dialog open={isCreatingCourse} onOpenChange={setIsCreatingCourse}>
          <DialogContent className="bg-gray-800 text-white border-gray-700 z-[10001]">
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription className="text-gray-400">
                Create a structured meal plan course for your community members
              </DialogDescription>
            </DialogHeader>
            <CourseForm
              onSubmit={(data) => {
                console.log('Creating course with data:', data);
                createCourseMutation.mutate(data);
              }}
              onCancel={() => setIsCreatingCourse(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Lesson Editor Modal */}
        {selectedLesson && (
          <LessonEditor
            lesson={selectedLesson}
            communityId={communityId}
            courseId={selectedCourse?.id || 0}
            onClose={() => setSelectedLesson(null)}
          />
        )}
      </div>
    </div>
  );
}

// Course Editor Component
function CourseEditor({
  course,
  communityId,
  onUpdate,
  onDelete,
  onSelectLesson,
}: {
  course: Course;
  communityId: string;
  onUpdate: (data: Partial<Course>) => void;
  onDelete: () => void;
  onSelectLesson: (lesson: Lesson) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(course);

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{course.emoji || '📚'}</span>
            {isEditing ? (
              <Input
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white text-xl font-semibold"
              />
            ) : (
              <h1 className="text-2xl font-bold text-white">{course.title}</h1>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  onClick={() => {
                    onUpdate(editData);
                    setIsEditing(false);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setEditData(course);
                    setIsEditing(false);
                  }}
                  variant="outline"
                  className="border-gray-600 text-gray-300"
                  size="sm"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="border-gray-600 text-gray-300"
                  size="sm"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  onClick={() => onUpdate({ is_published: !course.is_published })}
                  className={course.is_published ? "bg-gray-600" : "bg-green-600 hover:bg-green-700"}
                  size="sm"
                >
                  {course.is_published ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                  {course.is_published ? 'Unpublish' : 'Publish'}
                </Button>
                <Button
                  onClick={onDelete}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {isEditing ? (
          <Textarea
            value={editData.description || ''}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            placeholder="Course description..."
            className="bg-gray-700 border-gray-600 text-white"
            rows={3}
          />
        ) : (
          <p className="text-gray-300">{course.description || 'No description provided'}</p>
        )}

        <div className="flex items-center gap-4 mt-4">
          <Badge className="bg-gray-700 text-gray-300">
            <BookOpen className="h-3 w-3 mr-1" />
            {course.lesson_count} Lessons
          </Badge>
          <Badge className="bg-gray-700 text-gray-300">
            <Clock className="h-3 w-3 mr-1" />
            {course.category || 'All Levels'}
          </Badge>
        </div>
      </div>

      {/* Modules and Lessons */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Course Content</h2>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Module
            </Button>
            <Button
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Lesson
            </Button>
          </div>
        </div>

        {/* Sample lessons for demonstration */}
        <div className="space-y-3">
          {[
            { 
              id: 1, 
              title: "Introduction to Meal Planning", 
              emoji: "👋", 
              duration: 15,
              description: "Essential foundations for successful family meal planning",
              type: "video"
            },
            { 
              id: 2, 
              title: "Budget-Friendly Shopping", 
              emoji: "💰", 
              duration: 30,
              description: "Save money while maintaining nutrition quality",
              type: "lesson"
            },
            { 
              id: 3, 
              title: "Meal Prep Basics", 
              emoji: "📦", 
              duration: 45,
              description: "Efficient preparation strategies for busy families",
              type: "guide"
            },
          ].map((lesson) => (
            <Card
              key={lesson.id}
              className="bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors group"
              onClick={() => onSelectLesson(lesson as any)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-700 rounded-lg group-hover:bg-gray-600 transition-colors">
                      <span className="text-xl">{lesson.emoji}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white text-base">{lesson.title}</h3>
                        <Badge variant="secondary" className="text-xs bg-purple-600/20 text-purple-300 border-purple-600/30">
                          {lesson.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{lesson.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {lesson.duration} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Play className="w-3 h-3" />
                          Video lesson
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-400 h-8 w-8 p-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// Course Form Component
function CourseForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: Partial<Course>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<Course>>({
    title: '',
    description: '',
    emoji: '📚',
    category: 'beginner',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    if (!formData.title) {
      console.error('Title is required');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Course Title</label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., 30-Day Family Meal Plan"
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Emoji</label>
          <Select
            value={formData.emoji}
            onValueChange={(value) => setFormData({ ...formData, emoji: value })}
          >
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              {EMOJI_OPTIONS.map((emoji) => (
                <SelectItem key={emoji} value={emoji} className="text-white">
                  {emoji}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe what members will learn in this course..."
          className="bg-gray-700 border-gray-600 text-white"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty Level</label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData({ ...formData, category: value })}
        >
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-700 border-gray-600">
            <SelectItem value="beginner" className="text-white">Beginner</SelectItem>
            <SelectItem value="intermediate" className="text-white">Intermediate</SelectItem>
            <SelectItem value="advanced" className="text-white">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="border-gray-600 text-gray-300"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 text-white"
          disabled={!formData.title}
        >
          Create Course
        </Button>
      </div>
    </form>
  );
}

// Lesson Editor Component (placeholder - will be implemented in separate file)
function LessonEditor({
  lesson,
  communityId,
  courseId,
  onClose,
}: {
  lesson: Lesson;
  communityId: string;
  courseId: number;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Edit Lesson: {lesson.title}</h2>
          <Button onClick={onClose} variant="ghost" className="text-gray-400">
            ✕
          </Button>
        </div>
        <p className="text-gray-400">Lesson editor will be implemented here...</p>
      </div>
    </div>
  );
}