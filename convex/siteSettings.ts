import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const DEFAULT_SETTINGS = {
  key: "default" as const,
  webName: "Personal Blog",
  hero: {
    title: "Welcome to My Blog",
    description: "Thoughts, stories, and ideas about technology, design, and life.",
    imageUrl: "",
    ctaLabel: "",
    ctaHref: "",
  },
  background: "#f9fafb",
  fontFamily: "Inter Variable, ui-sans-serif, system-ui, sans-serif",
  colorScheme: {
    primary: "#2563eb",
    secondary: "#64748b",
  },
};

export const get = query({
  args: {},
  handler: async (ctx) => {
    const doc = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "default"))
      .first();
    return doc ?? null;
  },
});

export const update = mutation({
  args: {
    webName: v.optional(v.string()),
    hero: v.optional(
      v.object({
        title: v.string(),
        description: v.string(),
        imageUrl: v.optional(v.string()),
        ctaLabel: v.optional(v.string()),
        ctaHref: v.optional(v.string()),
      })
    ),
    background: v.optional(v.string()),
    fontFamily: v.optional(v.string()),
    colorScheme: v.optional(
      v.object({
        primary: v.string(),
        secondary: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "default"))
      .first();

    const base = existing ?? DEFAULT_SETTINGS;
    const next = {
      ...base,
      ...(args.webName !== undefined && { webName: args.webName }),
      ...(args.hero !== undefined && {
        hero: { ...base.hero, ...args.hero },
      }),
      ...(args.background !== undefined && { background: args.background }),
      ...(args.fontFamily !== undefined && { fontFamily: args.fontFamily }),
      ...(args.colorScheme !== undefined && {
        colorScheme: { ...base.colorScheme, ...args.colorScheme },
      }),
    };

    if (existing) {
      await ctx.db.patch(existing._id, next);
      return existing._id;
    }
    return await ctx.db.insert("siteSettings", next);
  },
});
