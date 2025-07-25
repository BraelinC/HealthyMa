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
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=transparent`;
};

const avatarStyles = [
  'fun-emoji', 'avataaars', 'big-smile', 'bottts', 'croodles', 'personas'
];

const commonPreferences = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Keto',
  'Paleo',
  'Low-Carb',
  'High-Protein',
  'Halal',
  'Kosher',
  'Nut-Free',
  'Soy-Free',
  'Low-Sodium',
  'Organic'
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
  const [newMember, setNewMember] = useState<any>({
    name: '',
    ageGroup: undefined,
    preferences: [],
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
    cacheTime: 10 * 60 * 1000 // Keep in cache for 10 minutes
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
      
      try {
        const result = await apiRequest('/api/profile', {
          method: 'POST',
          body: JSON.stringify(data)
        });
        return result;
      } catch (error: any) {
        console.error('Create profile API error:', error);
        throw new Error(error.message || 'Failed to create profile');
      }
    },
    onSuccess: (data) => {
      console.log('=== CREATE PROFILE SUCCESS ===');
      console.log('Response data:', data);
      toast({
        title: "Success",
        description: "Profile created successfully!"
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
    },
    onError: (error: any) => {
      console.error('=== CREATE PROFILE ERROR ===');
      console.error('Error details:', error);

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
      
      try {
        const result = await apiRequest('/api/profile', {
          method: 'PUT',
          body: JSON.stringify(data)
        });
        return result;
      } catch (error: any) {
        console.error('Update profile API error:', error);
        throw new Error(error.message || 'Failed to update profile');
      }
    },
    onSuccess: () => {
      toast({
        title: "Success", 
        description: "Profile updated successfully!"
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
    },
    onError: (error: any) => {
      console.error('=== UPDATE PROFILE ERROR ===');
      console.error('Error details:', error);

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
      setProfileName(profileData.profile_name || '');
      setPrimaryGoal(profileData.primary_goal || '');
      setFamilySize(profileData.family_size || 1);
      setMembers(profileData.members || []);

      // Detect profile type based on data
      if (profileData.family_size === 1 && (!profileData.members || profileData.members.length === 0)) {
        setProfileType('individual');
        // Load individual preferences if they exist
        if (profileData.preferences) {
          setIndividualPreferences(profileData.preferences);
        }
        if (profileData.goals) {
          setIndividualGoals(profileData.goals);
        }
      } else {
        setProfileType('family');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-emerald-50">
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-purple-500 to-emerald-500 p-3 rounded-full">
              <ChefHat className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-emerald-600 bg-clip-text text-transparent">
                Family Profile
              </h1>
              <p className="text-gray-600 mt-1">Create your personalized meal planning experience</p>
            </div>
          </div>
          {!isEditing && profile && (
            <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-emerald-500 hover:from-purple-600 hover:to-emerald-600 text-white border-0">
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>

        {!profile && !isEditing && !showProfileTypeSelection && (
          <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="bg-gradient-to-r from-purple-100 to-emerald-100 p-6 rounded-full w-fit mx-auto mb-6">
                <ChefHat className="h-16 w-16 text-purple-600 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-emerald-600 bg-clip-text text-transparent">
                Set Up Your Profile
              </h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Create your personalized profile to get customized meal plans and recipes that match your preferences and goals.
              </p>
              <Button onClick={() => setShowProfileTypeSelection(true)} className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-emerald-500 hover:from-purple-600 hover:to-emerald-600 text-white border-0 px-8 py-3">
                <Plus className="h-5 w-5" />
                Create Profile
              </Button>
            </CardContent>
          </Card>
        )}

        {!profile && !isEditing && showProfileTypeSelection && (
          <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-emerald-600 bg-clip-text text-transparent">
                  Choose Your Profile Type
                </h2>
                <p className="text-gray-600">
                  Select the option that best describes your meal planning needs.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card 
                  className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-purple-200 hover:border-purple-400 cursor-pointer transition-all duration-200 hover:scale-105"
                  onClick={() => {
                    setProfileType('individual');
                    setIsEditing(true);
                    setShowProfileTypeSelection(false);
                  }}
                >
                  <CardContent className="p-6 text-center">
                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-full w-fit mx-auto mb-4">
                      <User className="h-12 w-12 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-800">Individual Profile</h3>
                    <p className="text-gray-600 mb-4">
                      Perfect for personal meal planning with your own preferences and goals.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Set your dietary preferences</li>
                      <li>• Define personal health goals</li>
                      <li>• Get personalized meal plans</li>
                      <li>• Track individual progress</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card 
                  className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 hover:border-emerald-400 cursor-pointer transition-all duration-200 hover:scale-105"
                  onClick={() => {
                    setProfileType('family');
                    setIsEditing(true);
                    setShowProfileTypeSelection(false);
                  }}
                >
                  <CardContent className="p-6 text-center">
                    <div className="bg-gradient-to-r from-emerald-100 to-green-100 p-4 rounded-full w-fit mx-auto mb-4">
                      <Users className="h-12 w-12 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-800">Family Profile</h3>
                    <p className="text-gray-600 mb-4">
                      Ideal for families with multiple members and diverse preferences.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Add multiple family members</li>
                      <li>• Set individual preferences for each</li>
                      <li>• Get family-friendly meal plans</li>
                      <li>• Account for everyone's needs</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center mt-6">
                <Button 
                  onClick={() => setShowProfileTypeSelection(false)} 
                  variant="outline"
                  className="text-gray-600"
                >
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!profile && !isEditing && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/30 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-4 rounded-full w-fit mx-auto mb-4">
                  <Users className="h-8 w-8 text-pink-600" />
                </div>
                <h3 className="font-semibold mb-2">Family Members</h3>
                <p className="text-sm text-gray-600">Add each family member with their preferences and goals</p>
              </CardContent>
            </Card>
            <Card className="bg-white/30 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="bg-gradient-to-r from-blue-100 to-emerald-100 p-4 rounded-full w-fit mx-auto mb-4">
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Personal Goals</h3>
                <p className="text-sm text-gray-600">Set dietary goals and preferences for each family member</p>
              </CardContent>
            </Card>
            <Card className="bg-white/30 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="bg-gradient-to-r from-emerald-100 to-green-100 p-4 rounded-full w-fit mx-auto mb-4">
                  <ChefHat className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="font-semibold mb-2">Smart Meal Plans</h3>
                <p className="text-sm text-gray-600">Get personalized meal plans based on your family's profile</p>
              </CardContent>
            </Card>
          </div>
        )}

        {(isEditing || profile) && (
          <div className="space-y-6">
            <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-purple-600" />
                  {profileType === 'individual' ? 'Personal Profile' : 'Family Profile'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="profileName">Profile Name</Label>
                    <Input
                      id="profileName"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder={profileType === 'individual' ? "e.g., My Profile" : "e.g., Smith Family"}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  {profileType === 'family' && (
                    <div>
                      <Label htmlFor="familySize">Family Size</Label>
                      <Select 
                        value={familySize.toString()} 
                        onValueChange={(value) => setFamilySize(parseInt(value))}
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select family size" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(size => (
                            <SelectItem key={size} value={size.toString()}>
                              {size} {size === 1 ? 'person' : 'people'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="primaryGoal">Primary Goal</Label>
                  <Select 
                    value={primaryGoal} 
                    onValueChange={setPrimaryGoal}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select your main goal" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonGoals.map(goal => (
                        <SelectItem key={goal} value={goal}>{goal}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>


                {profileType === 'individual' && isEditing && (
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <div>
                      <Label>Dietary Preferences</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {commonPreferences.map(pref => (
                          <Button
                            key={pref}
                            onClick={() => addIndividualPreference(pref)}
                            variant={individualPreferences.includes(pref) ? "default" : "outline"}
                            size="sm"
                            className="text-xs"
                          >
                            {pref}
                          </Button>
                        ))}
                      </div>
                      {individualPreferences.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {individualPreferences.map((pref: string) => (
                            <Badge key={pref} variant="secondary" className="flex items-center gap-1">
                              {pref}
                              <button
                                onClick={() => removeIndividualPreference(pref)}
                                className="ml-1 text-red-500 hover:text-red-700"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label>Personal Goals</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {personalGoals.map(goal => (
                          <Button
                            key={goal}
                            onClick={() => addIndividualGoal(goal)}
                            variant={individualGoals.includes(goal) ? "default" : "outline"}
                            size="sm"
                            className="text-xs"
                          >
                            {goal}
                          </Button>
                        ))}
                      </div>
                      {individualGoals.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {individualGoals.map((goal: string) => (
                            <Badge key={goal} variant="secondary" className="flex items-center gap-1">
                              {goal}
                              <button
                                onClick={() => removeIndividualGoal(goal)}
                                className="ml-1 text-red-500 hover:text-red-700"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {profileType === 'individual' && !isEditing && (
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    {individualPreferences.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Dietary Preferences:</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {individualPreferences.map((pref: string) => (
                            <Badge key={pref} variant="outline">{pref}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {individualGoals.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Personal Goals:</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {individualGoals.map((goal: string) => (
                            <Badge key={goal} variant="outline">{goal}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Smart Cultural Preference Editor - Always visible */}
            <SmartCulturalPreferenceEditor
              culturalBackground={culturalBackground}
              onCulturalBackgroundChange={setCulturalBackground}
              onSave={handleSaveCulturalPreferences}
              isSaving={updateProfileMutation.isPending}
              showPreviewData={false}
            />

            {profileType === 'family' && (
              <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-emerald-600" />
                    Family Members
                  </CardTitle>
                </CardHeader>
              <CardContent className="space-y-4">
                {members.map((member: any, index: number) => {
                  const roleInfo = familyRoles.find(r => r.value === member.role);
                  const RoleIcon = roleInfo?.icon || User;

                  return (
                    <Card key={index} className="bg-gradient-to-r from-purple-50 to-emerald-50 border-0 shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <img 
                              src={member.avatar || generateAvatar(member.name)}
                              alt={member.name}
                              className="w-16 h-16 rounded-full bg-white border-2 border-purple-200"
                            />
                            {isEditing && (
                              <Button
                                onClick={() => randomizeAvatar(index)}
                                size="sm"
                                variant="outline"
                                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-white border-purple-200"
                              >
                                <Shuffle className="h-3 w-3" />
                              </Button>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{member.name}</h3>
                              {member.role && (
                                <Badge variant="outline" className={`flex items-center gap-1 ${roleInfo?.color}`}>
                                  <RoleIcon className="h-3 w-3" />
                                  {member.role}
                                </Badge>
                              )}
                              {member.ageGroup && (
                                <Badge variant="secondary">{member.ageGroup}</Badge>
                              )}
                              {isEditing && (
                                <Button
                                  onClick={() => removeMember(index)}
                                  size="sm"
                                  variant="outline"
                                  className="ml-auto text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>

                            {member.preferences && Array.isArray(member.preferences) && member.preferences.length > 0 && (
                              <div className="mb-3">
                                <Label className="text-sm font-medium">Dietary Preferences:</Label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {member.preferences.map((pref: string) => (
                                    <Badge key={pref} variant="outline" className="flex items-center gap-1">
                                      {pref}
                                      {isEditing && (
                                        <button
                                          onClick={() => removePreference(index, pref)}
                                          className="ml-1 text-red-500 hover:text-red-700"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      )}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {member.goals && Array.isArray(member.goals) && member.goals.length > 0 && (
                              <div>
                                <Label className="text-sm font-medium">Goals:</Label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {member.goals.map((goal: string) => (
                                    <Badge key={goal} variant="outline" className="flex items-center gap-1">
                                      {goal}
                                      {isEditing && (
                                        <button
                                          onClick={() => removeGoal(index, goal)}
                                          className="ml-1 text-red-500 hover:text-red-700"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      )}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {isEditing && (
                  <div className="space-y-4">
                    {!showMemberForm ? (
                      <Button
                        onClick={() => setShowMemberForm(true)}
                        className="w-full bg-gradient-to-r from-purple-500 to-emerald-500 hover:from-purple-600 hover:to-emerald-600 text-white border-0 py-8 text-lg"
                      >
                        <UserPlus className="h-6 w-6 mr-2" />
                        Add Family Member
                      </Button>
                    ) : (
                      <Card className="bg-gradient-to-r from-purple-50 to-emerald-50 border-2 border-purple-200">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="relative">
                              <img 
                                src={newMember.avatar || generateAvatar(newMember.name || 'default')}
                                alt="Avatar preview"
                                className="w-16 h-16 rounded-full bg-white border-2 border-purple-200"
                              />
                              <Button
                                onClick={() => randomizeAvatar(undefined, true)}
                                size="sm"
                                variant="outline"
                                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-white border-purple-200"
                              >
                                <Shuffle className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2">Add New Family Member</h3>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <Label htmlFor="memberName">Name</Label>
<Input
                                    id="memberName"
                                    value={newMember.name}
                                    onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                                    placeholder="Enter name"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="memberRole">Role</Label>
                                  <Select 
                                    value={newMember.role} 
                                    onValueChange={(value) => setNewMember({...newMember, role: value})}
                                  >
                                    <SelectTrigger className="mt-1">
                                      <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {familyRoles.map(role => (
                                        <SelectItem key={role.value} value={role.value}>
                                          <div className="flex items-center gap-2">
                                            <role.icon className={`h-4 w-4 ${role.color}`} />
                                            {role.value}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="memberAge">Age Group</Label>
                                  <Select 
                                    value={newMember.ageGroup} 
                                    onValueChange={(value) => setNewMember({...newMember, ageGroup: value})}
                                  >
                                    <SelectTrigger className="mt-1">
                                      <SelectValue placeholder="Select age group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {ageGroups.map(age => (
                                        <SelectItem key={age} value={age}>{age}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <Label>Dietary Preferences</Label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {commonPreferences.map(pref => (
                                  <Button
                                    key={pref}
                                    onClick={() => addPreference(pref)}
                                    variant={newMember.preferences.includes(pref) ? "default" : "outline"}
                                    size="sm"
                                    className="text-xs"
                                  >
                                    {pref}
                                  </Button>
                                ))}
                              </div>
                              {newMember.preferences.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {newMember.preferences.map((pref: string) => (
                                    <Badge key={pref} variant="secondary" className="flex items-center gap-1">
                                      {pref}
                                      <button
                                        onClick={() => setNewMember({
                                          ...newMember,
                                          preferences: newMember.preferences.filter((p: string) => p !== pref)
                                        })}
                                        className="ml-1 text-red-500 hover:text-red-700"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div>
                              <Label>Personal Goals</Label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {personalGoals.map(goal => (
                                  <Button
                                    key={goal}
                                    onClick={() => addGoal(goal)}
                                    variant={newMember.goals.includes(goal) ? "default" : "outline"}
                                    size="sm"
                                    className="text-xs"
                                  >
                                    {goal}
                                  </Button>
                                ))}
                              </div>
                              {newMember.goals.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {newMember.goals.map((goal: string) => (
                                    <Badge key={goal} variant="secondary" className="flex items-center gap-1">
                                      {goal}
                                      <button
                                        onClick={() => setNewMember({
                                          ...newMember,
                                          goals: newMember.goals.filter((g: string) => g !== goal)
                                        })}
                                        className="ml-1 text-red-500 hover:text-red-700"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 mt-6">
                            <Button onClick={addMember} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Member
                            </Button>
                            <Button onClick={() => setShowMemberForm(false)} variant="outline">
                              Cancel
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </CardContent>
              </Card>
            )}

            {isEditing && (
              <div className="flex gap-4 justify-end">
                <Button onClick={() => setIsEditing(false)} variant="outline">
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={createProfileMutation.isPending || updateProfileMutation.isPending} className="bg-gradient-to-r from-purple-500 to-emerald-500 hover:from-purple-600 hover:to-emerald-600 text-white border-0">
                  <Save className="h-4 w-4 mr-2" />
                  {createProfileMutation.isPending || updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}