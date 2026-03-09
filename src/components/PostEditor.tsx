import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { BlockEditor } from "./BlockEditor";
import { Id } from "../../convex/_generated/dataModel";

interface PostEditorProps {
  postId?: Id<"posts">;
  setCurrentView: (view: any) => void;
}

export function PostEditor({ postId, setCurrentView }: PostEditorProps) {
  const post = useQuery(api.posts.getPost, postId ? { postId } : "skip");
  const updatePost = useMutation(api.posts.updatePost);
  
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [blocks, setBlocks] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setExcerpt(post.excerpt || "");
      setBlocks(post.blocks || []);
    }
  }, [post]);

  const handleSave = async (publish = false) => {
    if (!postId) return;
    
    setIsSaving(true);
    try {
      await updatePost({
        postId,
        title,
        excerpt,
        blocks,
        published: publish,
      });
      toast.success(publish ? "Post published!" : "Post saved!");
    } catch (error) {
      toast.error("Failed to save post");
    } finally {
      setIsSaving(false);
    }
  };

  if (!postId) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">No post selected</p>
      </div>
    );
  }

  if (post === undefined) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Post not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => setCurrentView({ type: 'dashboard' })}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Back to Dashboard
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {isSaving ? "Saving..." : "Save Draft"}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {post.published ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="mb-8">
          <input
            type="text"
            placeholder="Post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-4xl font-bold text-gray-900 placeholder-gray-400 border-none outline-none mb-4"
          />
          <textarea
            placeholder="Write a brief excerpt..."
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className="w-full text-lg text-gray-600 placeholder-gray-400 border-none outline-none resize-none"
          />
        </div>

        <BlockEditor blocks={blocks} setBlocks={setBlocks} />
      </div>
    </div>
  );
}
