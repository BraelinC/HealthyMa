import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Eye,
  Video,
  Youtube,
  Image,
  Upload,
  Star,
  Minus,
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
  // Rich recipe data structure
  recipe_name?: string;
  meal_type?: string;
  cuisine?: string;
  ingredients: Ingredient[];
  instructions: Instruction[];
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

interface Ingredient {
  id: string;
  amount: string;
  unit: string;
  name: string;
}

interface Instruction {
  id: string;
  step: number;
  text: string;
}

interface LessonEditorProps {
  lesson?: Lesson;
  lessonData?: any; // For editing existing lessons
  communityId: string;
  courseId: number;
  moduleId?: number;
  onClose: () => void;
  onSave?: (lesson: Lesson) => void;
  isInline?: boolean;
}

// Smart unit suggestions based on ingredient type
const getUnitSuggestions = (ingredientName: string): string[] => {
  const ingredient = ingredientName.toLowerCase();
  
  // Liquids
  if (ingredient.includes('oil') || ingredient.includes('water') || ingredient.includes('milk') || 
      ingredient.includes('cream') || ingredient.includes('juice') || ingredient.includes('vinegar') ||
      ingredient.includes('wine') || ingredient.includes('broth') || ingredient.includes('stock') ||
      ingredient.includes('sauce') || ingredient.includes('syrup')) {
    return ['cup', 'fl oz', 'tbsp', 'tsp', 'ml'];
  }
  
  // Spices and small amounts
  if (ingredient.includes('salt') || ingredient.includes('pepper') || ingredient.includes('garlic powder') ||
      ingredient.includes('onion powder') || ingredient.includes('paprika') || ingredient.includes('cumin') ||
      ingredient.includes('oregano') || ingredient.includes('basil') || ingredient.includes('thyme') ||
      ingredient.includes('cinnamon') || ingredient.includes('nutmeg') || ingredient.includes('ginger') ||
      ingredient.includes('cayenne') || ingredient.includes('chili powder')) {
    return ['tsp', 'tbsp', 'pinch', 'dash', 'g'];
  }
  
  // Meat and proteins
  if (ingredient.includes('chicken') || ingredient.includes('beef') || ingredient.includes('pork') ||
      ingredient.includes('fish') || ingredient.includes('salmon') || ingredient.includes('turkey') ||
      ingredient.includes('lamb') || ingredient.includes('shrimp') || ingredient.includes('bacon')) {
    return ['lb', 'oz', 'kg', 'g', 'piece'];
  }
  
  // Vegetables (whole)
  if (ingredient.includes('onion') || ingredient.includes('potato') || ingredient.includes('tomato') ||
      ingredient.includes('carrot') || ingredient.includes('bell pepper') || ingredient.includes('cucumber') ||
      ingredient.includes('avocado') || ingredient.includes('lemon') || ingredient.includes('lime') ||
      ingredient.includes('apple') || ingredient.includes('banana')) {
    return ['piece', 'cup', 'lb', 'oz', 'large'];
  }
  
  // Flour and powders
  if (ingredient.includes('flour') || ingredient.includes('sugar') || ingredient.includes('powder') ||
      ingredient.includes('cornstarch') || ingredient.includes('cocoa')) {
    return ['cup', 'tbsp', 'tsp', 'lb', 'oz'];
  }
  
  // Eggs and dairy
  if (ingredient.includes('egg') || ingredient.includes('butter') || ingredient.includes('cheese') ||
      ingredient.includes('yogurt') || ingredient.includes('sour cream')) {
    return ['piece', 'cup', 'tbsp', 'oz', 'lb'];
  }
  
  // Rice, pasta, grains
  if (ingredient.includes('rice') || ingredient.includes('pasta') || ingredient.includes('quinoa') ||
      ingredient.includes('oats') || ingredient.includes('barley') || ingredient.includes('noodles')) {
    return ['cup', 'lb', 'oz', 'pkg', 'g'];
  }
  
  // Default suggestions
  return ['cup', 'tbsp', 'tsp', 'oz', 'lb'];
};

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
  lessonData: existingLessonData,
  communityId,
  courseId,
  moduleId,
  onClose,
  onSave,
  isInline = false,
}: LessonEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [lessonData, setLessonData] = useState<Lesson>(
    existingLessonData || lesson || {
      course_id: courseId,
      module_id: moduleId,
      title: "",
      emoji: "🍽️",
      description: "",
      video_url: "",
      youtube_video_id: "",
      image_url: "",
      recipe_name: "",
      meal_type: "Dinner",
      cuisine: "",
      ingredients: [{ id: '1', amount: '', unit: '', name: '' }],
      instructions: [{ id: '1', step: 1, text: '' }],
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
  const [sectionStates, setSectionStates] = useState({
    basicInfo: true,
    mediaVideo: true,
    recipeDetails: true,
    lessonSections: true,
  });

  // Recipe tab management
  const [activeTab, setActiveTab] = useState("basics");

  // Preview window tracking for real-time updates
  const [previewIsOpen, setPreviewIsOpen] = useState(false);

  // Handle when existing lesson data changes (for editing)
  useEffect(() => {
    console.log('🔄 existingLessonData changed:', existingLessonData);
    if (existingLessonData) {
      console.log('📝 Updating lesson data with existing data...');
      setLessonData(prevData => {
        const updatedData = {
          ...prevData,
          ...existingLessonData,
          // Ensure arrays are properly initialized
          ingredients: existingLessonData.ingredients?.length > 0 
            ? existingLessonData.ingredients 
            : [{ id: '1', amount: '', unit: '', name: '' }],
          instructions: existingLessonData.instructions?.length > 0 
            ? existingLessonData.instructions 
            : [{ id: '1', step: 1, text: '' }],
          sections: existingLessonData.sections?.length > 0 
            ? existingLessonData.sections 
            : DEFAULT_SECTIONS,
        };
        console.log('✅ Updated lesson data:', updatedData);
        return updatedData;
      });

      // Update section states based on what data exists in the lesson
      console.log('🎛️ Determining section states based on lesson data...');
      const newSectionStates = {
        // Basic Info: Always show if we have title or description
        basicInfo: !!(existingLessonData.title || existingLessonData.description),
        
        // Media & Video: Show if we have image or video
        mediaVideo: !!(existingLessonData.image_url || existingLessonData.youtube_video_id || existingLessonData.video_url),
        
        // Recipe Details: Show if we have recipe data
        recipeDetails: !!(
          existingLessonData.recipe_name ||
          existingLessonData.meal_type ||
          existingLessonData.cuisine ||
          existingLessonData.ingredients?.length > 0 ||
          existingLessonData.instructions?.length > 0 ||
          existingLessonData.prep_time ||
          existingLessonData.cook_time ||
          existingLessonData.servings
        ),
        
        // Lesson Sections: Show if we have lesson sections with actual content
        lessonSections: !!(existingLessonData.sections?.length > 0 && 
          existingLessonData.sections.some((section: any) => 
            section.content && section.content.trim().length > 0
          ))
      };
      
      console.log('🎛️ New section states:', newSectionStates);
      setSectionStates(newSectionStates);

      // Set the active tab based on what data exists
      if (existingLessonData.ingredients?.length > 0 || existingLessonData.instructions?.length > 0) {
        console.log('📝 Setting active tab to ingredients (has recipe data)');
        setActiveTab("ingredients");
      } else if (existingLessonData.recipe_name || existingLessonData.cuisine) {
        console.log('📝 Setting active tab to basics (has recipe basics)');
        setActiveTab("basics");
      } else {
        console.log('📝 Keeping default active tab (basics)');
        setActiveTab("basics");
      }
    }
  }, [existingLessonData]);

  // Preview functionality
  const collectCompletePreviewData = () => {
    return {
      // Basic Info
      title: lessonData.title,
      description: lessonData.description,
      emoji: lessonData.emoji,
      
      // Media & Video
      image_url: lessonData.image_url,
      youtube_video_id: lessonData.youtube_video_id,
      
      // Recipe Details (Rich Format)
      recipe_name: lessonData.recipe_name,
      meal_type: lessonData.meal_type,
      cuisine: lessonData.cuisine,
      difficulty_level: lessonData.difficulty_level,
      prep_time: lessonData.prep_time,
      cook_time: lessonData.cook_time,
      servings: lessonData.servings,
      
      // Rich Recipe Data
      ingredients: lessonData.ingredients,
      instructions: lessonData.instructions,
      
      // Lesson Sections
      sections: lessonData.sections,
      
      // Section Toggle States
      sectionStates: {
        basicInfo: sectionStates.basicInfo,
        mediaVideo: sectionStates.mediaVideo,
        recipeDetails: sectionStates.recipeDetails,
        lessonSections: sectionStates.lessonSections,
      },
      
      // Lesson metadata
      id: lessonData.id,
      course_id: lessonData.course_id,
      community_id: communityId,
    };
  };

  const handlePreview = () => {
    const previewData = collectCompletePreviewData();
    const previewId = lessonData.id || 'new';
    
    // Save preview data to sessionStorage
    sessionStorage.setItem(`lesson-preview-${previewId}`, JSON.stringify(previewData));
    
    // Track that preview is open for real-time updates
    setPreviewIsOpen(true);
    
    // Open preview in new tab and focus it
    const previewUrl = `/community/${communityId}/lesson/${previewId}/preview`;
    const previewWindow = window.open(previewUrl, '_blank');
    
    // Focus the preview window to bring it to front
    if (previewWindow) {
      previewWindow.focus();
    }
  };

  // Auto-save preview data for real-time updates
  useEffect(() => {
    if (previewIsOpen) {
      const previewData = collectCompletePreviewData();
      const previewId = lessonData.id || 'new';
      sessionStorage.setItem(`lesson-preview-${previewId}`, JSON.stringify(previewData));
      
      // Also trigger a custom event for cross-tab communication
      const event = new CustomEvent('lessonPreviewUpdate', { detail: previewData });
      window.dispatchEvent(event);
    }
  }, [lessonData, sectionStates, previewIsOpen]);

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

  // Update section state helper function
  const updateSectionState = (sectionKey: keyof typeof sectionStates, enabled: boolean) => {
    setSectionStates(prev => ({
      ...prev,
      [sectionKey]: enabled
    }));
  };

  // Recipe ingredient management
  const addIngredient = () => {
    const newId = (lessonData.ingredients.length + 1).toString();
    setLessonData({
      ...lessonData,
      ingredients: [...lessonData.ingredients, { id: newId, amount: '', unit: '', name: '' }]
    });
  };

  const removeIngredient = (id: string) => {
    if (lessonData.ingredients.length > 1) {
      setLessonData({
        ...lessonData,
        ingredients: lessonData.ingredients.filter(ing => ing.id !== id)
      });
    }
  };

  const updateIngredient = (id: string, field: keyof Ingredient, value: string) => {
    setLessonData({
      ...lessonData,
      ingredients: lessonData.ingredients.map(ing => 
        ing.id === id ? { ...ing, [field]: value } : ing
      )
    });
  };

  // Recipe instruction management  
  const addInstruction = () => {
    const newId = (lessonData.instructions.length + 1).toString();
    const newStep = lessonData.instructions.length + 1;
    setLessonData({
      ...lessonData,
      instructions: [...lessonData.instructions, { id: newId, step: newStep, text: '' }]
    });
  };

  const removeInstruction = (id: string) => {
    if (lessonData.instructions.length > 1) {
      const updatedInstructions = lessonData.instructions
        .filter(inst => inst.id !== id)
        .map((inst, index) => ({ ...inst, step: index + 1 }));
      
      setLessonData({
        ...lessonData,
        instructions: updatedInstructions
      });
    }
  };

  const updateInstruction = (id: string, text: string) => {
    setLessonData({
      ...lessonData,
      instructions: lessonData.instructions.map(inst => 
        inst.id === id ? { ...inst, text } : inst
      )
    });
  };

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


  const containerContent = (
    <div className={`bg-gray-800 rounded-lg w-full ${isInline ? 'max-h-[80vh] h-[80vh]' : 'max-w-7xl h-[90vh]'} flex flex-col`}>
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
                onClick={handlePreview}
                variant="outline"
                className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
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
        <div className={`flex-1 overflow-y-auto p-6 space-y-6 ${isInline ? 'min-h-0' : ''}`}>
          {/* 1. Basic Information Section */}
                {/* Basic Info */}
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">Basic Information</CardTitle>
                      <Switch
                        checked={sectionStates.basicInfo}
                        onCheckedChange={(checked) => updateSectionState('basicInfo', checked)}
                        className="data-[state=checked]:bg-purple-600"
                      />
                    </div>
                  </CardHeader>
                  {sectionStates.basicInfo && (
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
                          <SelectContent className="bg-gray-700 border-gray-600" style={{zIndex: 100006}}>
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
                  )}
                </Card>


          {/* 2. Media & Video Section */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Media & Video</CardTitle>
                <Switch
                  checked={sectionStates.mediaVideo}
                  onCheckedChange={(checked) => updateSectionState('mediaVideo', checked)}
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>
            </CardHeader>
            {sectionStates.mediaVideo && (
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
            )}
          </Card>

          {/* 3. Recipe Details Section - PLACEHOLDER FOR 3-TAB SYSTEM */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Recipe Details</CardTitle>
                <Switch
                  checked={sectionStates.recipeDetails}
                  onCheckedChange={(checked) => updateSectionState('recipeDetails', checked)}
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>
            </CardHeader>
            {sectionStates.recipeDetails && (
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-3 mb-6 bg-gray-800 border border-gray-600">
                    <TabsTrigger value="basics" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300">Recipe Basics</TabsTrigger>
                    <TabsTrigger value="ingredients" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300">Ingredients</TabsTrigger>
                    <TabsTrigger value="instructions" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300">Instructions</TabsTrigger>
                  </TabsList>

                  {/* Recipe Basics Tab */}
                  <TabsContent value="basics" className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-300 mb-2 block">
                          Recipe Name
                        </label>
                        <Input
                          placeholder="Enter recipe name..."
                          value={lessonData.recipe_name || ""}
                          onChange={(e) => setLessonData({ ...lessonData, recipe_name: e.target.value })}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-300 mb-2 block">
                          Meal Type
                        </label>
                        <Select value={lessonData.meal_type} onValueChange={(value) => setLessonData({ ...lessonData, meal_type: value })}>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue placeholder="Select meal type..." />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600" style={{zIndex: 100008}}>
                            <SelectItem value="Breakfast" className="text-white">🍳 Breakfast</SelectItem>
                            <SelectItem value="Lunch" className="text-white">🥗 Lunch</SelectItem>
                            <SelectItem value="Dinner" className="text-white">🍽️ Dinner</SelectItem>
                            <SelectItem value="Snack" className="text-white">🍎 Snack</SelectItem>
                            <SelectItem value="Dessert" className="text-white">🍰 Dessert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-300 mb-2 block">
                            <Clock className="h-4 w-4 inline mr-1" />
                            Prep Time (min)
                          </label>
                          <Input
                            type="number"
                            placeholder="15"
                            value={lessonData.prep_time}
                            onChange={(e) => setLessonData({ ...lessonData, prep_time: parseInt(e.target.value) || 0 })}
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-300 mb-2 block">
                            <ChefHat className="h-4 w-4 inline mr-1" />
                            Cook Time (min)
                          </label>
                          <Input
                            type="number"
                            placeholder="30"
                            value={lessonData.cook_time}
                            onChange={(e) => setLessonData({ ...lessonData, cook_time: parseInt(e.target.value) || 0 })}
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-300 mb-2 block">
                            <Users className="h-4 w-4 inline mr-1" />
                            Servings
                          </label>
                          <Input
                            type="number"
                            value={lessonData.servings}
                            onChange={(e) => setLessonData({ ...lessonData, servings: parseInt(e.target.value) || 0 })}
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-300 mb-2 block">
                            Cuisine Type
                          </label>
                          <Input
                            placeholder="e.g., Italian, Mexican, Asian..."
                            value={lessonData.cuisine || ""}
                            onChange={(e) => setLessonData({ ...lessonData, cuisine: e.target.value })}
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-300 mb-2 block">
                            <Star className="h-4 w-4 inline mr-1" />
                            Difficulty (1-5)
                          </label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <Button
                                key={level}
                                type="button"
                                variant={lessonData.difficulty_level >= level ? "default" : "outline"}
                                size="sm"
                                onClick={() => setLessonData({ ...lessonData, difficulty_level: level })}
                                className={`
                                  ${lessonData.difficulty_level >= level 
                                    ? 'bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-500' 
                                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600'
                                  }
                                `}
                              >
                                <Star className={`h-3 w-3 ${lessonData.difficulty_level >= level ? 'fill-current' : ''}`} />
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Ingredients Tab */}
                  <TabsContent value="ingredients" className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Ingredients</h3>
                      <Button onClick={addIngredient} size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Ingredient
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {lessonData.ingredients.map((ingredient) => (
                        <div key={ingredient.id} className="flex gap-2 items-center">
                          <div className="flex-1">
                            <Input
                              placeholder="Ingredient name"
                              value={ingredient.name}
                              onChange={(e) => updateIngredient(ingredient.id, 'name', e.target.value)}
                              className="bg-gray-700 border-gray-600 text-white"
                            />
                          </div>
                          <div className="w-20">
                            <Input
                              placeholder="1"
                              value={ingredient.amount}
                              onChange={(e) => updateIngredient(ingredient.id, 'amount', e.target.value)}
                              className="bg-gray-700 border-gray-600 text-white"
                            />
                          </div>
                          <div className="w-20">
                            <Input
                              placeholder="cup"
                              value={ingredient.unit}
                              onChange={(e) => updateIngredient(ingredient.id, 'unit', e.target.value)}
                              className="bg-gray-700 border-gray-600 text-white"
                            />
                          </div>
                          <Button
                            onClick={() => removeIngredient(ingredient.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Instructions Tab */}
                  <TabsContent value="instructions" className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Instructions</h3>
                      <Button onClick={addInstruction} size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Step
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {lessonData.instructions.map((instruction) => (
                        <div key={instruction.id} className="flex gap-3 items-start">
                          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 mt-1">
                            {instruction.step}
                          </div>
                          <div className="flex-1">
                            <Textarea
                              placeholder="Describe this step..."
                              value={instruction.text}
                              onChange={(e) => updateInstruction(instruction.id, e.target.value)}
                              rows={2}
                              className="bg-gray-700 border-gray-600 text-white"
                            />
                          </div>
                          <Button
                            onClick={() => removeInstruction(instruction.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 p-1 mt-1"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            )}
          </Card>

          {/* 4. Lesson Content Sections */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-white">Lesson Sections</CardTitle>
                  <Switch
                    checked={sectionStates.lessonSections}
                    onCheckedChange={(checked) => updateSectionState('lessonSections', checked)}
                    className="data-[state=checked]:bg-purple-600"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white w-48">
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600" style={{zIndex: 100006}}>
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
            {sectionStates.lessonSections && (
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
                    <div className="text-gray-300 whitespace-pre-wrap">
                      {section.content || "No content yet. Click edit to add content."}
                    </div>
                  )}
                </div>
              ))}
              </CardContent>
            )}
          </Card>
        </div>
    </div>
  );

  return isInline ? (
    containerContent
  ) : (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {containerContent}
    </div>
  );
}

