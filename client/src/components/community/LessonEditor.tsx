import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import RecipeCard from "@/components/RecipeCard";
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
  Save,
  X,
  ChefHat,
  Clock,
  Users,
  Play,
  FileText,
  Target,
  ListChecks,
  Info,
  ShoppingCart,
  Lightbulb,
  BookOpen,
  TrendingUp,
  Heart,
  GripVertical,
  Trash2,
  Edit,
  Video,
  Youtube,
  Image,
  Upload,
} from "lucide-react";

interface Lesson {
  id?: number;
  course_id: number;
  module_id?: number;
  title: string;
  emoji?: string;
  description?: string;
  video_url?: string;
  youtube_video_id?: string;
  image_url?: string;
  ingredients: string[];
  instructions: string[];
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty_level: number;
  lesson_order: number;
  is_published: boolean;
  nutrition_info?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  sections?: LessonSection[];
  meal_plans?: any[]; // Associated meal plan data
}

interface LessonSection {
  id?: number;
  section_type: "about" | "key_takeaways" | "action_steps" | "resources" | "custom";
  title: string;
  content: string;
  template_id?: string;
  display_order: number;
  is_visible?: boolean;
}

interface LessonEditorProps {
  lesson?: Lesson;
  communityId: string;
  courseId: number;
  moduleId?: number;
  onClose: () => void;
  onSave?: (lesson: Lesson) => void;
}

// Template content for different section types
const SECTION_TEMPLATES: Record<string, { title: string; content: string; icon: any }> = {
  meal_prep: {
    title: "Meal Prep Strategy",
    content: `## Preparation Timeline
- **Sunday**: Shop for ingredients and prep vegetables
- **Monday**: Cook proteins and grains in bulk
- **Wednesday**: Mid-week refresh of salads and quick prep items

## Storage Tips
- Store prepped vegetables in airtight containers with paper towels
- Keep proteins separate until assembly
- Label everything with dates for freshness tracking

## Time-Saving Techniques
- Use one-pan methods when possible
- Prep similar ingredients together
- Invest in quality storage containers`,
    icon: ChefHat,
  },
  shopping_guide: {
    title: "Shopping Guide",
    content: `## Essential Ingredients
- Fresh produce: [List seasonal options]
- Proteins: [Budget-friendly choices]
- Pantry staples: [Must-have items]

## Budget Tips
- Buy in bulk for frequently used items
- Choose seasonal produce for better prices
- Consider frozen vegetables for longer shelf life

## Shopping List Organization
- Group items by store section
- Note quantities needed
- Mark items that can be substituted`,
    icon: ShoppingCart,
  },
  techniques: {
    title: "Cooking Techniques",
    content: `## Key Skills
- **Knife Skills**: Proper chopping techniques for efficiency
- **Heat Control**: Understanding when to use high vs. low heat
- **Seasoning**: Building layers of flavor

## Common Mistakes to Avoid
- Overcrowding the pan
- Not preheating properly
- Adding salt too early to certain vegetables

## Pro Tips
- Read the entire recipe before starting
- Prep all ingredients before cooking
- Keep a "garbage bowl" nearby for scraps`,
    icon: BookOpen,
  },
  nutrition: {
    title: "Nutritional Benefits",
    content: `## Macro Breakdown
- **Protein**: Supports muscle maintenance and satiety
- **Carbohydrates**: Provides sustained energy
- **Healthy Fats**: Essential for nutrient absorption

## Key Nutrients
- Vitamins and minerals present
- Fiber content for digestive health
- Antioxidants for overall wellness

## Health Benefits
- Supports weight management goals
- Provides balanced nutrition
- Helps maintain stable energy levels`,
    icon: Heart,
  },
  time_management: {
    title: "Time-Saving Tips",
    content: `## Quick Prep Methods
- Use a food processor for chopping
- Cook multiple components simultaneously
- Batch similar tasks together

## Make-Ahead Options
- Prep vegetables the night before
- Cook grains in large batches
- Pre-mix spice blends

## Kitchen Organization
- Keep frequently used tools accessible
- Organize ingredients before starting
- Clean as you go to save time later`,
    icon: Clock,
  },
  cultural: {
    title: "Cultural Context",
    content: `## Origin & History
- Traditional background of this dish
- Regional variations
- Cultural significance

## Authentic Ingredients
- Traditional vs. modern substitutions
- Where to find specialty items
- Importance of specific ingredients

## Serving Traditions
- Traditional accompaniments
- Proper presentation
- Cultural dining customs`,
    icon: Info,
  },
};

// Default sections for a new lesson
const DEFAULT_SECTIONS: LessonSection[] = [
  {
    section_type: "about",
    title: "About This Lesson",
    content: "",
    template_id: "meal_prep",
    display_order: 0,
    is_visible: true,
  },
  {
    section_type: "key_takeaways",
    title: "Key Takeaways",
    content: "• Learn efficient meal prep techniques\n• Understand ingredient substitutions\n• Master time-saving cooking methods\n• Create balanced, nutritious meals",
    display_order: 1,
    is_visible: true,
  },
  {
    section_type: "action_steps",
    title: "Action Steps",
    content: "1. Review the complete recipe and ingredients list\n2. Shop for ingredients using the provided shopping guide\n3. Set aside 2 hours for meal prep on Sunday\n4. Follow the step-by-step instructions\n5. Store meals properly for the week",
    display_order: 2,
    is_visible: true,
  },
];

export function LessonEditor({
  lesson,
  communityId,
  courseId,
  moduleId,
  onClose,
  onSave,
}: LessonEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("content");
  const [lessonData, setLessonData] = useState<Lesson>(
    lesson || {
      course_id: courseId,
      module_id: moduleId,
      title: "",
      emoji: "🍽️",
      description: "",
      video_url: "",
      youtube_video_id: "",
      image_url: "",
      ingredients: [],
      instructions: [],
      prep_time: 15,
      cook_time: 30,
      servings: 4,
      difficulty_level: 2,
      lesson_order: 0,
      is_published: false,
      sections: DEFAULT_SECTIONS,
      meal_plans: [],
    }
  );
  const [selectedTemplate, setSelectedTemplate] = useState<string>("meal_prep");
  const [editingSection, setEditingSection] = useState<number | null>(null);

  // Save lesson mutation
  const saveLessonMutation = useMutation({
    mutationFn: async (data: Lesson) => {
      const url = data.id
        ? `/api/communities/${communityId}/lessons/${data.id}`
        : `/api/communities/${communityId}/courses/${courseId}/lessons`;
      const method = data.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to save lesson");
      return response.json();
    },
    onSuccess: (savedLesson) => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/courses`] });
      toast({ title: "Lesson saved", description: "Your lesson has been saved successfully." });
      if (onSave) onSave(savedLesson);
      onClose();
    },
  });

  // Add a new section
  const addSection = (type: "about" | "custom") => {
    const template = SECTION_TEMPLATES[selectedTemplate];
    const newSection: LessonSection = {
      section_type: type,
      title: template?.title || "Custom Section",
      content: template?.content || "",
      template_id: type === "about" ? selectedTemplate : undefined,
      display_order: lessonData.sections?.length || 0,
      is_visible: true,
    };

    setLessonData({
      ...lessonData,
      sections: [...(lessonData.sections || []), newSection],
    });
  };

  // Update a section
  const updateSection = (index: number, updates: Partial<LessonSection>) => {
    const sections = [...(lessonData.sections || [])];
    sections[index] = { ...sections[index], ...updates };
    setLessonData({ ...lessonData, sections });
  };

  // Delete a section
  const deleteSection = (index: number) => {
    const sections = (lessonData.sections || []).filter((_, i) => i !== index);
    setLessonData({ ...lessonData, sections });
  };

  // Reorder sections
  const moveSection = (index: number, direction: "up" | "down") => {
    const sections = [...(lessonData.sections || [])];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];
    sections.forEach((section, i) => {
      section.display_order = i;
    });

    setLessonData({ ...lessonData, sections });
  };

  // Add ingredient
  const addIngredient = () => {
    setLessonData({
      ...lessonData,
      ingredients: [...lessonData.ingredients, ""],
    });
  };

  // Update ingredient
  const updateIngredient = (index: number, value: string) => {
    const ingredients = [...lessonData.ingredients];
    ingredients[index] = value;
    setLessonData({ ...lessonData, ingredients });
  };

  // Delete ingredient
  const deleteIngredient = (index: number) => {
    const ingredients = lessonData.ingredients.filter((_, i) => i !== index);
    setLessonData({ ...lessonData, ingredients });
  };

  // Add instruction
  const addInstruction = () => {
    setLessonData({
      ...lessonData,
      instructions: [...lessonData.instructions, ""],
    });
  };

  // Update instruction
  const updateInstruction = (index: number, value: string) => {
    const instructions = [...lessonData.instructions];
    instructions[index] = value;
    setLessonData({ ...lessonData, instructions });
  };

  // Delete instruction
  const deleteInstruction = (index: number) => {
    const instructions = lessonData.instructions.filter((_, i) => i !== index);
    setLessonData({ ...lessonData, instructions });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{lessonData.emoji || "🍽️"}</span>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {lessonData.id ? "Edit Lesson" : "Create New Lesson"}
                </h2>
                <p className="text-sm text-gray-400">
                  Design your meal plan lesson with video, recipes, and educational content
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => saveLessonMutation.mutate(lessonData)}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={saveLessonMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {saveLessonMutation.isPending ? "Saving..." : "Save Lesson"}
              </Button>
              <Button onClick={onClose} variant="ghost" className="text-gray-400">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="bg-gray-700 border-b border-gray-600 rounded-none px-4">
              <TabsTrigger value="content" className="text-gray-300 data-[state=active]:text-white">
                <FileText className="h-4 w-4 mr-2" />
                Content & Sections
              </TabsTrigger>
              <TabsTrigger value="recipe" className="text-gray-300 data-[state=active]:text-white">
                <ChefHat className="h-4 w-4 mr-2" />
                Recipe Details
              </TabsTrigger>
              <TabsTrigger value="media" className="text-gray-300 data-[state=active]:text-white">
                <Video className="h-4 w-4 mr-2" />
                Media & Video
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-gray-300 data-[state=active]:text-white">
                <Play className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              {/* Content & Sections Tab */}
              <TabsContent value="content" className="p-6 space-y-6">
                {/* Basic Info */}
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Lesson Title
                        </label>
                        <Input
                          value={lessonData.title}
                          onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })}
                          placeholder="e.g., Week 1: Meal Prep Basics"
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Emoji</label>
                        <Select
                          value={lessonData.emoji}
                          onValueChange={(value) => setLessonData({ ...lessonData, emoji: value })}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            {["🍽️", "🥗", "🍝", "🍜", "🍱", "🍲", "🥘", "🍳", "🥙", "🌮", "🍕", "🍔"].map(
                              (emoji) => (
                                <SelectItem key={emoji} value={emoji} className="text-white">
                                  {emoji}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description
                      </label>
                      <Textarea
                        value={lessonData.description}
                        onChange={(e) => setLessonData({ ...lessonData, description: e.target.value })}
                        placeholder="Brief description of what students will learn..."
                        className="bg-gray-700 border-gray-600 text-white"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Lesson Sections */}
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">Lesson Sections</CardTitle>
                      <div className="flex items-center gap-2">
                        <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white w-48">
                            <SelectValue placeholder="Select template" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            {Object.entries(SECTION_TEMPLATES).map(([key, template]) => (
                              <SelectItem key={key} value={key} className="text-white">
                                {template.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={() => addSection("about")}
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Section
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {lessonData.sections?.map((section, index) => (
                      <div
                        key={index}
                        className="bg-gray-800 border border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-gray-400" />
                            {editingSection === index ? (
                              <Input
                                value={section.title}
                                onChange={(e) =>
                                  updateSection(index, { title: e.target.value })
                                }
                                className="bg-gray-700 border-gray-600 text-white"
                                autoFocus
                              />
                            ) : (
                              <h3 className="font-medium text-white">{section.title}</h3>
                            )}
                            {section.template_id && (
                              <Badge className="bg-purple-600 text-white text-xs">
                                {SECTION_TEMPLATES[section.template_id]?.title}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              onClick={() => moveSection(index, "up")}
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 p-1"
                              disabled={index === 0}
                            >
                              ↑
                            </Button>
                            <Button
                              onClick={() => moveSection(index, "down")}
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 p-1"
                              disabled={index === (lessonData.sections?.length || 0) - 1}
                            >
                              ↓
                            </Button>
                            <Button
                              onClick={() => setEditingSection(editingSection === index ? null : index)}
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 p-1"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => deleteSection(index)}
                              variant="ghost"
                              size="sm"
                              className="text-red-400 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {editingSection === index ? (
                          <Textarea
                            value={section.content}
                            onChange={(e) => updateSection(index, { content: e.target.value })}
                            className="bg-gray-700 border-gray-600 text-white"
                            rows={6}
                            placeholder="Enter section content..."
                          />
                        ) : (
                          <div className="text-gray-300 whitespace-pre-wrap text-sm">
                            {section.content || "No content yet..."}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Recipe Details Tab */}
              <TabsContent value="recipe" className="p-6 space-y-6">
                {/* Cooking Info */}
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Cooking Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Prep Time (min)
                        </label>
                        <Input
                          type="number"
                          value={lessonData.prep_time}
                          onChange={(e) =>
                            setLessonData({ ...lessonData, prep_time: parseInt(e.target.value) || 0 })
                          }
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Cook Time (min)
                        </label>
                        <Input
                          type="number"
                          value={lessonData.cook_time}
                          onChange={(e) =>
                            setLessonData({ ...lessonData, cook_time: parseInt(e.target.value) || 0 })
                          }
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Servings
                        </label>
                        <Input
                          type="number"
                          value={lessonData.servings}
                          onChange={(e) =>
                            setLessonData({ ...lessonData, servings: parseInt(e.target.value) || 0 })
                          }
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Difficulty (1-5)
                        </label>
                        <Select
                          value={lessonData.difficulty_level.toString()}
                          onValueChange={(value) =>
                            setLessonData({ ...lessonData, difficulty_level: parseInt(value) })
                          }
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <SelectItem key={level} value={level.toString()} className="text-white">
                                {"⭐".repeat(level)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Ingredients */}
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">Ingredients</CardTitle>
                      <Button
                        onClick={addIngredient}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Ingredient
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {lessonData.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-gray-400 w-8">{index + 1}.</span>
                        <Input
                          value={ingredient}
                          onChange={(e) => updateIngredient(index, e.target.value)}
                          placeholder="e.g., 2 cups all-purpose flour"
                          className="bg-gray-700 border-gray-600 text-white flex-1"
                        />
                        <Button
                          onClick={() => deleteIngredient(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Instructions */}
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">Instructions</CardTitle>
                      <Button
                        onClick={addInstruction}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Step
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {lessonData.instructions.map((instruction, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-gray-400 w-8 mt-2">{index + 1}.</span>
                        <Textarea
                          value={instruction}
                          onChange={(e) => updateInstruction(index, e.target.value)}
                          placeholder="Describe this step..."
                          className="bg-gray-700 border-gray-600 text-white flex-1"
                          rows={2}
                        />
                        <Button
                          onClick={() => deleteInstruction(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 p-1 mt-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Media Tab */}
              <TabsContent value="media" className="p-6 space-y-6">
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Video Content</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        YouTube Video ID
                      </label>
                      <div className="flex items-center gap-2">
                        <Youtube className="h-5 w-5 text-red-500" />
                        <Input
                          value={lessonData.youtube_video_id || ""}
                          onChange={(e) =>
                            setLessonData({ ...lessonData, youtube_video_id: e.target.value })
                          }
                          placeholder="e.g., dQw4w9WgXcQ"
                          className="bg-gray-700 border-gray-600 text-white flex-1"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Enter the YouTube video ID (the part after v= in the URL)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Or Direct Video URL
                      </label>
                      <Input
                        value={lessonData.video_url || ""}
                        onChange={(e) => setLessonData({ ...lessonData, video_url: e.target.value })}
                        placeholder="https://example.com/video.mp4"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Cover Image URL
                      </label>
                      <Input
                        value={lessonData.image_url || ""}
                        onChange={(e) => setLessonData({ ...lessonData, image_url: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>

                    {lessonData.image_url && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-300 mb-2">Preview:</p>
                        <img
                          src={lessonData.image_url}
                          alt="Cover"
                          className="w-full max-w-md rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Invalid+Image";
                          }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preview Tab */}
              <TabsContent value="preview" className="p-6">
                <div className="max-w-4xl mx-auto">
                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{lessonData.emoji}</span>
                        <div className="flex-1">
                          <CardTitle className="text-white text-2xl">{lessonData.title || "Untitled Lesson"}</CardTitle>
                          <p className="text-gray-400 mt-1">{lessonData.description}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Video Preview */}
                      {lessonData.youtube_video_id && (
                        <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <Play className="h-12 w-12 text-purple-400 mx-auto mb-2" />
                            <p className="text-gray-400">YouTube Video: {lessonData.youtube_video_id}</p>
                          </div>
                        </div>
                      )}

                      {/* Sections Preview */}
                      {lessonData.sections?.map((section, index) => (
                        <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                          <h3 className="font-semibold text-white mb-3">{section.title}</h3>
                          <div className="text-gray-300 whitespace-pre-wrap">{section.content}</div>
                        </div>
                      ))}

                      {/* Recipe Card Preview */}
                      {lessonData.ingredients.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                            <h3 className="font-semibold text-white mb-3">
                              <ShoppingCart className="inline h-4 w-4 mr-2" />
                              Ingredients
                            </h3>
                            <ul className="space-y-1 text-gray-300">
                              {lessonData.ingredients.map((ingredient, index) => (
                                <li key={index}>• {ingredient}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                            <h3 className="font-semibold text-white mb-3">
                              <Clock className="inline h-4 w-4 mr-2" />
                              Cooking Info
                            </h3>
                            <div className="space-y-2 text-gray-300">
                              <div>Prep: {lessonData.prep_time} minutes</div>
                              <div>Cook: {lessonData.cook_time} minutes</div>
                              <div>Servings: {lessonData.servings}</div>
                              <div>Difficulty: {"⭐".repeat(lessonData.difficulty_level)}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Instructions Preview */}
                      {lessonData.instructions.length > 0 && (
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                          <h3 className="font-semibold text-white mb-3">
                            <ListChecks className="inline h-4 w-4 mr-2" />
                            Instructions
                          </h3>
                          <ol className="space-y-2 text-gray-300">
                            {lessonData.instructions.map((instruction, index) => (
                              <li key={index} className="flex gap-3">
                                <span className="font-medium text-purple-400">{index + 1}.</span>
                                <span>{instruction}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}