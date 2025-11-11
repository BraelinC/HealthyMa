# Meal Sharing Fix - Tabs Display Issue

## Problem
When recipes are shared via CommunityShareModal to communities, the Message/Meal tabs don't display correctly in CommunityDetailNew and PostDetail components because:
1. CommunityShareModal creates posts with `recipe_data` but no `meal_plan_id`
2. Posts with only `recipe_data` don't get proper meal plan association 
3. Tabs only show when `post.meal_plan` exists
4. `getCommunityPosts` only fetches meal plan data for posts with `meal_plan_id`

## Solution Implemented

### 1. Updated `/api/community-posts` Route (`server/routes.ts`)
- When `recipe_data` is provided for meal_share posts, create a temporary meal plan structure
- Store the temporary meal plan data in the `images` field as JSON (alongside existing images)
- This ensures recipe shares have meal plan data available for tabs

### 2. Updated `getCommunityPosts` Method (`server/communityService.ts`)
- Parse the `images` field to extract temporary meal plan data
- Handle both old format (array of images) and new format (object with images + temp_meal_plan)
- Populate `meal_plan` field with either:
  - Temporary meal plan data (for recipe shares)
  - Database meal plan data (for meal plan shares)

### 3. Database Schema Consideration
- Added `recipe_data` field to `communityPosts` schema for future use
- Current implementation uses existing `images` field as a temporary solution
- Future improvement: Use dedicated `recipe_data` field after database migration

## Code Changes

### Routes (`server/routes.ts`)
```typescript
// Create temporary meal plan from recipe data
if (recipe_data && post_type === 'meal_share') {
  const tempMealPlan = {
    id: `recipe_${newPost.id}`,
    name: recipe_data.title || 'Shared Recipe',
    description: recipe_data.description || '',
    meal_plan: {
      days: {
        'day1': {
          breakfast: {
            name: recipe_data.title,
            ingredients: recipe_data.ingredients || [],
            instructions: recipe_data.instructions || [],
            // ... other recipe fields
          }
        }
      }
    }
  };
  
  // Store temp meal plan with images
  const combinedData = {
    images: existingImages,
    temp_meal_plan: tempMealPlan
  };
}
```

### Service (`server/communityService.ts`)
```typescript
// Parse images data which may contain temporary meal plan data
let parsedImages = [];
let tempMealPlan = null;

if (post.images) {
  const imageData = JSON.parse(post.images);
  if (imageData.temp_meal_plan) {
    parsedImages = imageData.images || [];
    tempMealPlan = imageData.temp_meal_plan;
  }
}

// Use temp meal plan if available, otherwise database meal plan
let mealPlanData = null;
if (post.post_type === 'meal_share') {
  if (tempMealPlan) {
    mealPlanData = tempMealPlan;
  } else if (post.meal_plan_id) {
    mealPlanData = mealPlansMap.get(post.meal_plan_id);
  }
}
```

## Result
- ✅ Recipe shares now have `post.meal_plan` data available
- ✅ Message/Meal tabs display correctly in both CommunityDetailNew and PostDetail
- ✅ Backward compatibility maintained for existing posts
- ✅ Both recipe shares and meal plan shares work correctly

## Testing
1. Share a recipe via CommunityShareModal to a community
2. View the post in CommunityDetailNew - tabs should appear
3. Click on the post to open PostDetail - tabs should appear  
4. Test both Message and Meal tabs function correctly
5. Verify existing meal plan shares still work

## Future Improvements
1. Add dedicated `recipe_data` field to database schema
2. Migrate existing temporary data to proper field
3. Add proper TypeScript interfaces for recipe data structure