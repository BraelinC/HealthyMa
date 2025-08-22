import { db } from "./db";
import { 
  communities, 
  communityMembers, 
  sharedMealPlans, 
  mealPlanReviews,
  mealPlanRemixes,
  communityDiscussions,
  communityPosts,
  communityPostComments,
  communityPostLikes,
  creatorProfiles,
  creatorFollowers,
  users,
  type Community,
  type CommunityMember,
  type SharedMealPlan,
  type MealPlanReview,
  type CommunityPost,
  type CommunityPostComment,
  type InsertCommunity,
  type InsertCommunityMember,
  type InsertSharedMealPlan,
  type InsertMealPlanReview,
  type InsertCommunityPost,
  type InsertCommunityPostComment,
  type InsertCommunityPostLike,
} from "@shared/schema";
import { eq, and, desc, sql, gte, inArray } from "drizzle-orm";

export class CommunityService {
  // Create a new community
  async createCommunity(userId: string, data: Omit<InsertCommunity, 'creator_id'>): Promise<Community> {
    const [community] = await db.insert(communities).values({
      ...data,
      creator_id: userId,
      member_count: 1,
    }).returning();

    // Automatically add creator as a member with creator role
    await db.insert(communityMembers).values({
      community_id: community.id,
      user_id: userId,
      role: "creator",
      points: 0,
      level: 1,
    });

    return community;
  }

  // Get all communities with optional filtering
  async getCommunities(category?: string, userId?: string) {
    let whereConditions = [];
    
    if (category) {
      whereConditions.push(eq(communities.category, category));
    }

    const allCommunities = await db.select()
      .from(communities)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(communities.member_count));

    // If userId provided, mark which communities the user is a member of
    if (userId) {
      const userMemberships = await db.select()
        .from(communityMembers)
        .where(eq(communityMembers.user_id, userId));
      
      const membershipMap = new Set(userMemberships.map(m => m.community_id));
      
      return allCommunities.map(community => ({
        ...community,
        isMember: membershipMap.has(community.id),
      }));
    }

    return allCommunities;
  }

  // Get community details with member info
  async getCommunityDetails(communityId: number, userId?: string) {
    const [community] = await db.select()
      .from(communities)
      .where(eq(communities.id, communityId));

    if (!community) {
      throw new Error("Community not found");
    }

    // Get member info if userId provided
    let memberInfo = null;
    if (userId) {
      const [member] = await db.select()
        .from(communityMembers)
        .where(and(
          eq(communityMembers.community_id, communityId),
          eq(communityMembers.user_id, userId)
        ));
      memberInfo = member;
    }

    // Get top contributors
    const topContributors = await db.select()
      .from(communityMembers)
      .where(eq(communityMembers.community_id, communityId))
      .orderBy(desc(communityMembers.points))
      .limit(10);

    return {
      ...community,
      memberInfo,
      topContributors,
    };
  }

  // Join a community
  async joinCommunity(userId: string, communityId: number): Promise<CommunityMember> {
    // Check if already a member
    const existing = await db.select()
      .from(communityMembers)
      .where(and(
        eq(communityMembers.community_id, communityId),
        eq(communityMembers.user_id, userId)
      ));

    if (existing.length > 0) {
      throw new Error("Already a member of this community");
    }

    // Add member
    const [member] = await db.insert(communityMembers).values({
      community_id: communityId,
      user_id: userId,
      role: "member",
      points: 0,
      level: 1,
    }).returning();

    // Update member count
    await db.update(communities)
      .set({ 
        member_count: sql`${communities.member_count} + 1`,
        updated_at: new Date(),
      })
      .where(eq(communities.id, communityId));

    return member;
  }

  // Leave a community
  async leaveCommunity(userId: string, communityId: number): Promise<void> {
    // Check if member and not creator
    const [member] = await db.select()
      .from(communityMembers)
      .where(and(
        eq(communityMembers.community_id, communityId),
        eq(communityMembers.user_id, userId)
      ));

    if (!member) {
      throw new Error("Not a member of this community");
    }

    if (member.role === "creator") {
      throw new Error("Creator cannot leave their own community");
    }

    // Remove member
    await db.delete(communityMembers)
      .where(and(
        eq(communityMembers.community_id, communityId),
        eq(communityMembers.user_id, userId)
      ));

    // Update member count
    await db.update(communities)
      .set({ 
        member_count: sql`${communities.member_count} - 1`,
        updated_at: new Date(),
      })
      .where(eq(communities.id, communityId));
  }

  // Share a meal plan to community
  async shareMealPlan(
    userId: string, 
    communityId: number, 
    mealPlanId: number,
    data: Omit<InsertSharedMealPlan, 'community_id' | 'meal_plan_id' | 'sharer_id'>
  ): Promise<SharedMealPlan> {
    // Verify user is a member
    const member = await this.verifyMembership(userId, communityId);

    // Share the meal plan
    const [sharedPlan] = await db.insert(sharedMealPlans).values({
      ...data,
      community_id: communityId,
      meal_plan_id: mealPlanId,
      sharer_id: userId,
    }).returning();

    // Award points for sharing
    await this.awardPoints(userId, communityId, 25, "shared_meal_plan");

    return sharedPlan;
  }

  // Get shared meal plans for a community
  async getCommunityMealPlans(communityId: number, filter?: {
    featured?: boolean;
    minRating?: number;
    tags?: string[];
  }) {
    let whereConditions = [eq(sharedMealPlans.community_id, communityId)];

    if (filter?.featured) {
      whereConditions.push(eq(sharedMealPlans.is_featured, true));
    }

    const plans = await db.select()
      .from(sharedMealPlans)
      .where(and(...whereConditions))
      .orderBy(desc(sharedMealPlans.created_at));

    // Filter by tags if provided
    if (filter?.tags && filter.tags.length > 0) {
      return plans.filter(plan => {
        const planTags = plan.tags as string[];
        return filter.tags!.some(tag => planTags.includes(tag));
      });
    }

    return plans;
  }

  // Add a review to a shared meal plan
  async reviewMealPlan(
    userId: string,
    sharedPlanId: number,
    review: Omit<InsertMealPlanReview, 'shared_plan_id' | 'reviewer_id'>
  ): Promise<MealPlanReview> {
    // Check if already reviewed
    const existing = await db.select()
      .from(mealPlanReviews)
      .where(and(
        eq(mealPlanReviews.shared_plan_id, sharedPlanId),
        eq(mealPlanReviews.reviewer_id, userId)
      ));

    if (existing.length > 0) {
      throw new Error("You have already reviewed this meal plan");
    }

    // Add review
    const [newReview] = await db.insert(mealPlanReviews).values({
      ...review,
      shared_plan_id: sharedPlanId,
      reviewer_id: userId,
    }).returning();

    // Update success rate if they tried it
    if (review.tried_it) {
      await this.updatePlanSuccessRate(sharedPlanId);
    }

    // Award points for reviewing
    const [sharedPlan] = await db.select()
      .from(sharedMealPlans)
      .where(eq(sharedMealPlans.id, sharedPlanId));
    
    if (sharedPlan) {
      await this.awardPoints(userId, sharedPlan.community_id, 10, "reviewed_meal_plan");
    }

    return newReview;
  }

  // Mark a meal plan as tried
  async markPlanAsTried(userId: string, sharedPlanId: number): Promise<void> {
    // Update tries count
    await db.update(sharedMealPlans)
      .set({ 
        tries: sql`${sharedMealPlans.tries} + 1`,
      })
      .where(eq(sharedMealPlans.id, sharedPlanId));

    // Award points
    const [sharedPlan] = await db.select()
      .from(sharedMealPlans)
      .where(eq(sharedMealPlans.id, sharedPlanId));
    
    if (sharedPlan) {
      await this.awardPoints(userId, sharedPlan.community_id, 15, "tried_meal_plan");
    }
  }

  // Get trending meal plans across all communities
  async getTrendingMealPlans(limit: number = 10) {
    // Get plans from the last 7 days with high engagement
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trending = await db.select()
      .from(sharedMealPlans)
      .where(gte(sharedMealPlans.created_at, sevenDaysAgo))
      .orderBy(
        desc(sql`${sharedMealPlans.likes} + ${sharedMealPlans.tries} * 2`)
      )
      .limit(limit);

    return trending;
  }

  // Private helper methods
  private async verifyMembership(userId: string, communityId: number): Promise<CommunityMember> {
    const [member] = await db.select()
      .from(communityMembers)
      .where(and(
        eq(communityMembers.community_id, communityId),
        eq(communityMembers.user_id, userId)
      ));

    if (!member) {
      throw new Error("You must be a member to perform this action");
    }

    return member;
  }

  private async awardPoints(
    userId: string, 
    communityId: number, 
    points: number, 
    reason: string
  ): Promise<void> {
    await db.update(communityMembers)
      .set({ 
        points: sql`${communityMembers.points} + ${points}`,
        level: sql`CASE 
          WHEN ${communityMembers.points} + ${points} >= 500 THEN 5
          WHEN ${communityMembers.points} + ${points} >= 300 THEN 4
          WHEN ${communityMembers.points} + ${points} >= 150 THEN 3
          WHEN ${communityMembers.points} + ${points} >= 50 THEN 2
          ELSE 1
        END`,
      })
      .where(and(
        eq(communityMembers.community_id, communityId),
        eq(communityMembers.user_id, userId)
      ));
  }

  private async updatePlanSuccessRate(sharedPlanId: number): Promise<void> {
    // Calculate success rate based on reviews
    const reviews = await db.select()
      .from(mealPlanReviews)
      .where(and(
        eq(mealPlanReviews.shared_plan_id, sharedPlanId),
        eq(mealPlanReviews.tried_it, true)
      ));

    if (reviews.length > 0) {
      const positiveReviews = reviews.filter(r => r.rating >= 4).length;
      const successRate = Math.round((positiveReviews / reviews.length) * 100);

      await db.update(sharedMealPlans)
        .set({ success_rate: successRate })
        .where(eq(sharedMealPlans.id, sharedPlanId));
    }
  }

  // ============================================
  // COMMUNITY POSTS METHODS
  // ============================================

  // Create a new community post
  async createCommunityPost(
    userId: string, 
    communityId: number, 
    data: Omit<InsertCommunityPost, 'author_id' | 'community_id'>
  ): Promise<CommunityPost & { author: any }> {
    // Verify membership
    await this.verifyMembership(userId, communityId);

    console.log('Creating post with data:', JSON.stringify(data, null, 2));

    // Handle images properly for PostgreSQL - store as JSON string  
    let imagesForDB = null;
    if (data.images && Array.isArray(data.images) && data.images.length > 0) {
      imagesForDB = JSON.stringify(data.images);
    }

    console.log('Images for DB (JSON string):', imagesForDB);

    const [post] = await db.insert(communityPosts).values({
      content: data.content,
      post_type: data.post_type || 'discussion',
      meal_plan_id: data.meal_plan_id || null,
      images: imagesForDB,
      author_id: userId,
      community_id: communityId,
    }).returning();

    // Get author info
    const [author] = await db.select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      profileImageUrl: users.profileImageUrl,
      full_name: users.full_name,
    }).from(users).where(eq(users.id, userId));

    // Award points for posting
    await this.awardPoints(userId, communityId, 10, "created_post");

    return {
      ...post,
      images: post.images ? JSON.parse(post.images) : [], // Parse JSON string back to array
      author: author || { id: userId, firstName: null, lastName: null, profileImageUrl: null, full_name: null }
    };
  }

  // Get community posts with pagination and filtering
  async getCommunityPosts(
    communityId: number, 
    options: {
      limit?: number;
      offset?: number;
      type?: string;
      userId?: string;
    } = {}
  ) {
    const { limit = 20, offset = 0, type, userId } = options;

    let whereConditions = [eq(communityPosts.community_id, communityId)];

    if (type) {
      whereConditions.push(eq(communityPosts.post_type, type));
    }

    const posts = await db.select({
      post: communityPosts,
      author: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        full_name: users.full_name,
      }
    })
    .from(communityPosts)
    .leftJoin(users, eq(communityPosts.author_id, users.id))
    .where(and(...whereConditions))
    .orderBy(desc(communityPosts.is_pinned), desc(communityPosts.created_at))
    .limit(limit)
    .offset(offset);

    // Check which posts the user has liked (if userId provided)
    let userLikes = new Set<number>();
    if (userId && posts.length > 0) {
      const postIds = posts.map(({ post }) => post.id);
      const likes = await db.select()
        .from(communityPostLikes)
        .where(
          and(
            eq(communityPostLikes.user_id, userId),
            inArray(communityPostLikes.post_id, postIds)
          )
        );
      userLikes = new Set(likes.map(like => like.post_id!));
    }

    // Return posts with proper formatting for frontend
    return posts.map(({ post, author }) => ({
      ...post,
      images: post.images ? JSON.parse(post.images) : [], // Parse JSON string back to array
      username: author?.full_name || author?.firstName || 'Anonymous',
      likes_count: post.likes,
      comments_count: post.comments_count || 0, // Ensure comments_count is included
      author: author || { id: post.author_id, firstName: null, lastName: null, profileImageUrl: null, full_name: null },
      isLiked: userLikes.has(post.id),
      is_liked: userLikes.has(post.id),
      created_at: post.created_at ? new Date(post.created_at).toLocaleString() : new Date().toLocaleString()
    }));
  }

  // Like a community post (no unlike functionality)
  async likePost(userId: string, postId: number): Promise<{ liked: boolean, likesCount: number }> {
    // Check if already liked
    const [existingLike] = await db.select()
      .from(communityPostLikes)
      .where(and(
        eq(communityPostLikes.post_id, postId),
        eq(communityPostLikes.user_id, userId)
      ));

    if (existingLike) {
      // Already liked - return current state without changing anything
      const [post] = await db.select().from(communityPosts).where(eq(communityPosts.id, postId));
      return { liked: true, likesCount: post.likes || 0 };
    }

    // Like - add like and increment count
    await db.insert(communityPostLikes).values({
      post_id: postId,
      user_id: userId,
    });

    await db.update(communityPosts)
      .set({ likes: sql`${communityPosts.likes} + 1` })
      .where(eq(communityPosts.id, postId));

    const [post] = await db.select().from(communityPosts).where(eq(communityPosts.id, postId));
    return { liked: true, likesCount: post.likes || 0 };
  }

  // Add a comment to a community post
  async addPostComment(
    userId: string, 
    postId: number, 
    content: string, 
    parentId?: number
  ): Promise<CommunityPostComment & { author: any }> {
    const [comment] = await db.insert(communityPostComments).values({
      post_id: postId,
      author_id: userId,
      content,
      parent_id: parentId,
    }).returning();

    // Increment comments count on post
    await db.update(communityPosts)
      .set({ comments_count: sql`${communityPosts.comments_count} + 1` })
      .where(eq(communityPosts.id, postId));

    // Get author info
    const [author] = await db.select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      profileImageUrl: users.profileImageUrl,
      full_name: users.full_name,
    }).from(users).where(eq(users.id, userId));

    return {
      ...comment,
      author: author || { id: userId, firstName: null, lastName: null, profileImageUrl: null, full_name: null }
    };
  }

  // Get comments for a post
  async getPostComments(postId: number, userId?: string) {
    const comments = await db.select({
      comment: communityPostComments,
      author: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        full_name: users.full_name,
      }
    })
    .from(communityPostComments)
    .leftJoin(users, eq(communityPostComments.author_id, users.id))
    .where(eq(communityPostComments.post_id, postId))
    .orderBy(communityPostComments.created_at);

    return comments.map(({ comment, author }) => ({
      ...comment,
      author: author || { id: comment.author_id, firstName: null, lastName: null, profileImageUrl: null, full_name: null }
    }));
  }
}

export const communityService = new CommunityService();