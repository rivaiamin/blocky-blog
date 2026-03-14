import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

interface DashboardProps {
  setCurrentView: (view: any) => void;
}

export function Dashboard({ setCurrentView }: DashboardProps) {
  const posts = useQuery(api.posts.getUserPosts);
  const createPost = useMutation(api.posts.createPost);
  const deletePost = useMutation(api.posts.deletePost);
  const [isCreating, setIsCreating] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");

  const handleCreatePost = async () => {
    if (!newPostTitle.trim()) return;
    
    setIsCreating(true);
    try {
      const slug = newPostTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const postId = await createPost({ 
        title: newPostTitle.trim(),
        slug: slug || 'untitled'
      });
      setCurrentView({ type: 'editor', postId });
      toast.success("Post created!");
    } catch (error) {
      toast.error("Failed to create post");
    } finally {
      setIsCreating(false);
      setNewPostTitle("");
    }
  };

  const handleDeletePost = async (postId: Id<"posts">) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    try {
      await deletePost({ postId });
      toast.success("Post deleted");
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold theme-text-primary">Dashboard</h1>
      </div>

      <div className="theme-card bg-white/90 backdrop-blur-sm border border-slate-200/80 p-6 mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Create New Post</h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Post title..."
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreatePost()}
            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none"
          />
          <button
            onClick={handleCreatePost}
            disabled={!newPostTitle.trim() || isCreating}
            className="theme-btn px-6 py-2.5 theme-bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isCreating ? "Creating..." : "Create"}
          </button>
        </div>
      </div>

      <div className="theme-card bg-white/90 backdrop-blur-sm border border-slate-200/80 overflow-hidden">
        <div className="p-6 border-b border-slate-200/80">
          <h2 className="text-lg font-semibold text-slate-900">Your Posts</h2>
        </div>

        {posts === undefined ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-200 border-t-slate-600 mx-auto" />
          </div>
        ) : posts.length === 0 ? (
          <div className="p-6 text-center text-slate-500">No posts yet. Create your first post above!</div>
        ) : (
          <div className="divide-y divide-slate-200/80">
            {posts.map((post) => (
              <div key={post._id} className="p-6 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">{post.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span>{new Date(post._creationTime).toLocaleDateString()}</span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          post.published ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {post.published ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentView({ type: "editor", postId: post._id })}
                      className="px-3 py-1.5 text-sm font-medium theme-text-primary hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setCurrentView({ type: "post", postId: post._id })}
                      className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeletePost(post._id)}
                      className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
