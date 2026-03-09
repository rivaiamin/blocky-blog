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
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
