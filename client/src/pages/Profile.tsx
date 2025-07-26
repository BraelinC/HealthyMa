import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, X, Users, Target, ChefHat, Save, UserPlus, Edit3, Heart, Home, Shuffle, Baby, User, Crown, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Profile, FamilyMember } from '@shared/schema';
import CulturalCuisineDropdown from '@/components/CulturalCuisineDropdown';
import CulturalFreeTextInput from '@/components/CulturalFreeTextInput';
import SmartCulturalPreferenceEditor from '@/components/SmartCulturalPreferenceEditor';
import WeightBasedProfile from '@/components/WeightBasedProfile';
import AchievementsContainer from '@/components/AchievementsContainer';
import PerplexityCacheViewer from '@/components/PerplexityCacheViewer';
import ProfilePromptPreview from '@/components/ProfilePromptPreview';

const commonGoals = [
  'Lose Weight',
  'Gain Muscle',
  'Improve Health',
  'Save Money',
  'Save Time',
  'Eat More Variety',
  'Learn New Recipes',
  'Meal Prep Efficiency'
];

const ageGroups = ['Child', 'Teen', 'Adult'] as const;

const familyRoles = [
  { value: 'Mom', icon: Crown, color: 'text-pink-500' },
  { value: 'Dad', icon: User, color: 'text-blue-500' },
  { value: 'Child', icon: Baby, color: 'text-green-500' },
  { value: 'Teen', icon: User, color: 'text-purple-500' },
  { value: 'Partner', icon: Heart, color: 'text-red-500' },
  { value: 'Other', icon: User, color: 'text-gray-500' }
];

// Avatar generator using DiceBear API
const generateAvatar = (seed: string, style: string = 'fun-emoji'): string => {
  const avatar = `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=transparent`;
  console.log('Generated avatar URL:', avatar);
  return avatar;
};

const avatarStyles = [
  'fun-emoji', 'avataaars', 'big-smile', 'bottts', 'croodles', 'personas'
];

const commonPreferences = [
  'Loves Italian',
  'Enjoys Asian',
  'Mexican Food Fan',
  'Mediterranean',
  'Comfort Food',
  'Adventurous Eater',
  'Prefers Simple',
  'No Spicy Food',
  'Sweet Tooth',
  'Savory Lover'
];

const commonDietaryRestrictions = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Egg-Free',
  'Soy-Free',
  'Shellfish Allergy',
  'Fish Allergy',
  'Halal',
  'Kosher',
  'Low-Sodium',
  'Diabetic',
  'Keto',
  'Paleo'
];

const personalGoals = [
  'Lose Weight',
  'Gain Muscle',
  'Improve Health',
  'Try New Foods',
  'Eat More Vegetables',
  'Reduce Sugar',
  'Increase Protein',
  'Build Healthy Habits'
];

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Using unified smart profile system only

  const [isEditing, setIsEditing] = useState(false);
  const [profileType, setProfileType] = useState<'individual' | 'family'>('family');
  const [showProfileTypeSelection, setShowProfileTypeSelection] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [familySize, setFamilySize] = useState(1);
  const [members, setMembers] = useState<any[]>([]);
  const [showMemberForm, setShowMemberForm] = useState(false);

  // Individual profile state
  const [individualPreferences, setIndividualPreferences] = useState<string[]>([]);
  const [individualGoals, setIndividualGoals] = useState<string[]>([]);
  const [culturalBackground, setCulturalBackground] = useState<string[]>([]);
  const [isParsingCulture, setIsParsingCulture] = useState(false);
  const [isCachingCuisines, setIsCachingCuisines] = useState(false);
  const [showCachedData, setShowCachedData] = useState(false);
  const [showPerplexityCache, setShowPerplexityCache] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [newMember, setNewMember] = useState<any>({
    name: '',
    ageGroup: undefined,
    preferences: [],
    dietaryRestrictions: [],
    goals: [],
    avatar: '',
    role: '',
    avatarStyle: 'fun-emoji'
  });

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['/api/profile'],
    enabled: !!user,
    retry: 2,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes to prevent conflicts
    gcTime: 10 * 60 * 1000 // Keep in cache for 10 minutes (formerly cacheTime)
  });

  // Log profile data for debugging
  useEffect(() => {
    console.log('=== PROFILE QUERY STATE ===');
    console.log('User:', user);
    console.log('IsLoading:', isLoading);
    console.log('Error:', error);
    console.log('Profile:', profile);
  }, [user, isLoading, error, profile]);

  const createProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('=== CREATE PROFILE MUTATION CALLED ===');
      console.log('Data being sent:', data);
      setSaveStatus('saving');
      
      try {
        const result = await apiRequest('/api/profile', {
          method: 'POST',
          body: JSON.stringify(data)
        });
        return result;
      } catch (error: any) {
        console.error('Create profile API error:', error);
        setSaveStatus('idle');
        throw new Error(error.message || 'Failed to create profile');
      }
    },
    onSuccess: (data) => {
      console.log('=== CREATE PROFILE SUCCESS ===');
      console.log('Response data:', data);
      setSaveStatus('saved');
      toast({
        title: "Success",  
        description: "Profile created successfully!"
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      
      // Reset to idle after showing saved state
      setTimeout(() => setSaveStatus('idle'), 2000);
    },
    onError: (error: any) => {
      console.error('=== CREATE PROFILE ERROR ===');
      console.error('Error details:', error);
      setSaveStatus('idle');

      let errorMessage = "Failed to create profile. Please try again.";
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('=== UPDATE PROFILE MUTATION CALLED ===');
      console.log('Data being sent:', data);
      setSaveStatus('saving');
      
      try {
        const result = await apiRequest('/api/profile', {
          method: 'PUT',
          body: JSON.stringify(data)
        });
        return result;
      } catch (error: any) {
        console.error('Update profile API error:', error);
        setSaveStatus('idle');
        throw new Error(error.message || 'Failed to update profile');
      }
    },
    onSuccess: () => {
      setSaveStatus('saved');
      toast({
        title: "Success", 
        description: "Profile updated successfully!"
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      
      // Reset to idle after showing saved state
      setTimeout(() => setSaveStatus('idle'), 2000);
    },
    onError: (error: any) => {
      console.error('=== UPDATE PROFILE ERROR ===');
      console.error('Error details:', error);
      setSaveStatus('idle');

      let errorMessage = "Failed to update profile. Please try again.";
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  // Load profile data when available
  useEffect(() => {
    if (profile) {
      const profileData = profile as any;
      console.log('Loading profile data:', profileData);
      console.log('Profile members:', profileData.members);
      setProfileName(profileData.profile_name || '');
      setPrimaryGoal(profileData.primary_goal || '');
      setFamilySize(profileData.family_size || 1);
      setMembers(profileData.members || []);

      // Detect profile type based on data
      // If profile has an explicit profile_type field, use that
      if (profileData.profile_type) {
        setProfileType(profileData.profile_type);
      } else {
        // Fall back to legacy detection logic
        // Only consider it individual if explicitly no members AND family_size is 1
        // This allows single-parent families (family_size = 1 with members)
        if (profileData.family_size === 1 && (!profileData.members || profileData.members.length === 0)) {
          setProfileType('individual');
        } else {
          setProfileType('family');
        }
      }
      
      // Load individual preferences if they exist (for individual profiles)
      if (profileType === 'individual' || 
          (profileData.family_size === 1 && (!profileData.members || profileData.members.length === 0))) {
        if (profileData.preferences) {
          setIndividualPreferences(profileData.preferences);
        }
        if (profileData.goals) {
          setIndividualGoals(profileData.goals);
        }
      }

      // Load cultural background for all profile types
      if (profileData.cultural_background) {
        console.log('🔄 Loading cultural background from profile:', profileData.cultural_background);
        // Only update if the new data is different to prevent overwrites during save operations
        const currentCuisines = JSON.stringify(culturalBackground.sort());
        const newCuisines = JSON.stringify(profileData.cultural_background.sort());
        if (currentCuisines !== newCuisines) {
          console.log('🔄 Cultural background changed, updating state');
          setCulturalBackground(profileData.cultural_background);
        } else {
          console.log('🔄 Cultural background unchanged, keeping current state');
        }
      } else {
        console.log('⚠️ No cultural_background found in profile data');
        // Only clear if we currently have cuisines (to prevent clearing on initial load)
        if (culturalBackground.length > 0) {
          setCulturalBackground([]);
        }
      }
    }
  }, [profile]);

  // Debug cultural background changes
  useEffect(() => {
    console.log('🎯 Cultural background state changed:', culturalBackground);
  }, [culturalBackground]);

  // Auto-generate avatar when member name changes
  useEffect(() => {
    if (newMember.name && !newMember.avatar) {
      const avatar = generateAvatar(newMember.name, newMember.avatarStyle);
      setNewMember(prev => ({ ...prev, avatar }));
    }
  }, [newMember.name, newMember.avatarStyle]);

  const handleSubmit = () => {
    console.log('=== HANDLE SUBMIT CALLED ===');
    console.log('Profile name:', profileName);
    console.log('Primary goal:', primaryGoal);
    console.log('Family size:', familySize);
    console.log('Profile type:', profileType);
    console.log('Members count:', members.length);
    console.log('Members:', members);
    console.log('Members with avatars:', members.map(m => ({ name: m.name, avatar: m.avatar, dietaryRestrictions: m.dietaryRestrictions })));
    console.log('Existing profile:', profile);

    // Validate required fields
    if (!profileName?.trim()) {
      toast({
        title: "Error",
        description: "Profile name is required.",
        variant: "destructive"
      });
      return;
    }

    if (!primaryGoal) {
      toast({
        title: "Error", 
        description: "Primary goal is required.",
        variant: "destructive"
      });
      return;
    }

    const profileData = {
      profile_name: profileName.trim(),
      primary_goal: primaryGoal,
      family_size: profileType === 'individual' ? 1 : familySize,
      members: profileType === 'individual' ? [] : members,
      profile_type: profileType,
      cultural_background: culturalBackground,
      // For individual profiles, store preferences and goals directly
      ...(profileType === 'individual' && {
        preferences: individualPreferences,
        goals: individualGoals
      })
    };

    console.log('Profile data to save:', profileData);

    if (profile) {
      console.log('Updating existing profile...');
      updateProfileMutation.mutate(profileData);
    } else {
      console.log('Creating new profile...');
      createProfileMutation.mutate(profileData);
    }
  };

  const addIndividualPreference = (preference: string) => {
    if (!individualPreferences.includes(preference)) {
      setIndividualPreferences([...individualPreferences, preference]);
    }
  };

  const removeIndividualPreference = (preference: string) => {
    setIndividualPreferences(individualPreferences.filter(p => p !== preference));
  };

  const addIndividualGoal = (goal: string) => {
    if (!individualGoals.includes(goal)) {
      setIndividualGoals([...individualGoals, goal]);
    }
  };

  const removeIndividualGoal = (goal: string) => {
    setIndividualGoals(individualGoals.filter(g => g !== goal));
  };

  // Smart cultural preference save function
  const handleSaveCulturalPreferences = async (overrideCuisines?: string[]) => {
    if (!profile) return;
    
    const cuisinesToSave = overrideCuisines || culturalBackground;
    console.log('🔄 Saving cultural preferences:', cuisinesToSave);
    console.log('🔄 Override cuisines provided:', overrideCuisines);
    console.log('🔄 Current state culturalBackground:', culturalBackground);
    
    const profileData = {
      profile_name: profileName.trim() || (profile as any).profile_name,
      primary_goal: primaryGoal || (profile as any).primary_goal,
      family_size: familySize || (profile as any).family_size,
      members: members.length > 0 ? members : (profile as any).members,
      profile_type: profileType,
      cultural_background: cuisinesToSave,
      // Preserve existing preferences and goals
      ...(profileType === 'individual' && {
        preferences: individualPreferences.length > 0 ? individualPreferences : (profile as any).preferences,
        goals: individualGoals.length > 0 ? individualGoals : (profile as any).goals
      })
    };

    try {
      await updateProfileMutation.mutateAsync(profileData);
      
      // Wait a moment before invalidating to ensure database update is complete
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      }, 500);
      
      console.log('✅ Cultural preferences saved successfully!');
      
      toast({
        title: "Cultural preferences updated!",
        description: "Your cultural cuisine preferences have been saved."
      });
    } catch (error) {
      console.error('❌ Error saving cultural preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save cultural preferences. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Cultural Cuisine Caching Functions
  const handleCacheCulturalCuisines = async () => {
    if (culturalBackground.length === 0) {
      toast({
        title: "No cuisines to cache",
        description: "Please add some cultural cuisines to your profile first.",
        variant: "destructive"
      });
      return;
    }

    setIsCachingCuisines(true);
    try {
      const response = await apiRequest('/api/cache-cultural-cuisines', {
        method: 'POST'
      });
      
      toast({
        title: "Success",
        description: `${response.message} - ${response.cached.length}/${response.total} cuisines cached successfully`
      });
    } catch (error) {
      console.error('Error caching cuisines:', error);
      toast({
        title: "Error",
        description: "Failed to cache cultural cuisine data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCachingCuisines(false);
    }
  };

  const { data: cacheStats } = useQuery({
    queryKey: ['/api/culture-cache-stats'],
    enabled: !!user && showCachedData,
    refetchInterval: 30000 // Refresh every 30 seconds when viewing
  });

  const addMember = () => {
    if (newMember.name?.trim()) {
      const memberWithAvatar = {
        ...newMember,
        avatar: newMember.avatar || generateAvatar(newMember.name, newMember.avatarStyle)
      };
      setMembers([...members, memberWithAvatar]);
      setNewMember({ 
        name: '', 
        ageGroup: undefined, 
        preferences: [], 
        dietaryRestrictions: [],
        goals: [],
        avatar: '',
        role: '',
        avatarStyle: 'fun-emoji'
      });
      setShowMemberForm(false);
    }
  };

  const randomizeAvatar = (memberIndex?: number, isNewMember: boolean = false) => {
    const randomStyle = avatarStyles[Math.floor(Math.random() * avatarStyles.length)];
    const name = isNewMember ? newMember.name : members[memberIndex!]?.name;
    const randomSeed = `${name}-${Math.random().toString(36).substring(7)}`;
    const newAvatar = generateAvatar(randomSeed, randomStyle);

    if (isNewMember) {
      setNewMember({...newMember, avatar: newAvatar, avatarStyle: randomStyle});
    } else if (memberIndex !== undefined) {
      const updatedMembers = [...members];
      updatedMembers[memberIndex] = {...updatedMembers[memberIndex], avatar: newAvatar, avatarStyle: randomStyle};
      setMembers(updatedMembers);
    }
  };

  const addPreference = (preference: string) => {
    if (!newMember.preferences.includes(preference)) {
      setNewMember({
        ...newMember,
        preferences: [...newMember.preferences, preference]
      });
    }
  };

  const addDietaryRestriction = (restriction: string) => {
    if (!newMember.dietaryRestrictions.includes(restriction)) {
      setNewMember({
        ...newMember,
        dietaryRestrictions: [...newMember.dietaryRestrictions, restriction]
      });
    }
  };

  const removePreference = (memberIndex: number, preference: string) => {
    const updatedMembers = [...members];
    updatedMembers[memberIndex].preferences = updatedMembers[memberIndex].preferences.filter(
      (p: string) => p !== preference
    );
    setMembers(updatedMembers);
  };

  const addGoal = (goal: string) => {
    if (!newMember.goals.includes(goal)) {
      setNewMember({
        ...newMember,
        goals: [...newMember.goals, goal]
      });
    }
  };

  const removeGoal = (memberIndex: number, goal: string) => {
    const updatedMembers = [...members];
    updatedMembers[memberIndex].goals = updatedMembers[memberIndex].goals.filter(
      (g: string) => g !== goal
    );
    setMembers(updatedMembers);
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Always use the smart profile system
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-emerald-50">
      <div className="container mx-auto p-4 max-w-4xl">
        <WeightBasedProfile />
      </div>
    </div>
  );
}
