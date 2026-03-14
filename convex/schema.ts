import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  posts: defineTable({
    title: v.string(),
    slug: v.string(),
    excerpt: v.optional(v.string()),
    coverImage: v.optional(v.id("_storage")),
    published: v.boolean(),
    authorId: v.id("users"),
    blocks: v.array(v.object({
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
    })),
  })
    .index("by_author", ["authorId"])
    .index("by_slug", ["slug"])
    .index("by_published", ["published"]),

  siteSettings: defineTable({
    key: v.literal("default"),
    webName: v.string(),
    hero: v.object({
      title: v.string(),
      description: v.string(),
      imageUrl: v.optional(v.string()),
      ctaLabel: v.optional(v.string()),
      ctaHref: v.optional(v.string()),
    }),
    background: v.string(),
    fontFamily: v.string(),
    colorScheme: v.object({
      primary: v.string(),
      secondary: v.string(),
    }),
  }).index("by_key", ["key"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
