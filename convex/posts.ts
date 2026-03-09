import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createPost = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("posts", {
      title: args.title,
      slug: args.slug,
      published: false,
      authorId: userId,
      blocks: [{
        id: "initial",
        type: "paragraph",
        content: { text: "Start writing..." },
        order: 0,
      }],
    });
  },
});

export const updatePost = mutation({
  args: {
    postId: v.id("posts"),
    title: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    published: v.optional(v.boolean()),
    blocks: v.optional(v.array(v.object({
      id: v.string(),
      type: v.union(
        v.literal("heading"),
        v.literal("paragraph"),
        v.literal("image"),
        v.literal("quote"),
        v.literal("list"),
        v.literal("divider")
      ),
      content: v.any(),
      order: v.number(),
    }))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const post = await ctx.db.get(args.postId);
    if (!post || post.authorId !== userId) {
      throw new Error("Post not found or unauthorized");
    }

    const updates: any = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.excerpt !== undefined) updates.excerpt = args.excerpt;
    if (args.published !== undefined) updates.published = args.published;
    if (args.blocks !== undefined) updates.blocks = args.blocks;

    await ctx.db.patch(args.postId, updates);
  },
});

export const getPost = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const post = await ctx.db.get(args.postId);
    
    if (!post) return null;
    
    // Allow viewing published posts or own posts
    if (!post.published && post.authorId !== userId) {
      return null;
    }
    
    return post;
  },
});

export const getPostBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    
    if (!post || !post.published) return null;
    
    return post;
  },
});

export const getUserPosts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("posts")
      .withIndex("by_author", (q) => q.eq("authorId", userId))
      .order("desc")
      .collect();
  },
});

export const getPublishedPosts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .order("desc")
      .collect();
  },
});

export const deletePost = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const post = await ctx.db.get(args.postId);
    if (!post || post.authorId !== userId) {
      throw new Error("Post not found or unauthorized");
    }

    await ctx.db.delete(args.postId);
  },
});
