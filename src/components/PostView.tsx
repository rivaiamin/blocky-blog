import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface PostViewProps {
  postId?: Id<"posts">;
  slug?: string;
  setCurrentView: (view: any) => void;
}

export function PostView({ postId, slug, setCurrentView }: PostViewProps) {
  const postById = useQuery(api.posts.getPost, postId ? { postId } : "skip");
  const postBySlug = useQuery(api.posts.getPostBySlug, slug ? { slug } : "skip");
  
  const post = postById || postBySlug;

  if (post === undefined) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-slate-600" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Post not found</h2>
        <button
          onClick={() => setCurrentView({ type: "home" })}
          className="theme-text-primary font-medium hover:opacity-80"
        >
          ← Back to home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => setCurrentView({ type: "home" })}
        className="theme-text-primary font-medium hover:opacity-80 transition-opacity mb-8 inline-flex items-center gap-1"
      >
        ← Back to blog
      </button>

      <article className="theme-card bg-white/90 backdrop-blur-sm border border-slate-200/80 p-8 lg:p-10">
        <header className="mb-8">
          <h1 className="text-4xl font-bold theme-text-primary mb-4">{post.title}</h1>
          {post.excerpt && (
            <p className="text-xl text-slate-600 mb-4">{post.excerpt}</p>
          )}
          <div className="text-sm theme-text-secondary">
            Published on {new Date(post._creationTime).toLocaleDateString()}
          </div>
        </header>

        <div className="prose prose-lg max-w-none">
          {post.blocks?.map((block: any) => (
            <BlockDisplay key={block.id} block={block} />
          ))}
        </div>
      </article>
    </div>
  );
}

function BlockDisplay({ block }: { block: any }) {
  switch (block.type) {
    case 'heading':
      const level = block.content.level || 2;
      if (level === 1) {
        return (
          <h1 className="text-3xl font-bold mb-4">
            {block.content.text}
          </h1>
        );
      } else if (level === 2) {
        return (
          <h2 className="text-2xl font-bold mb-4">
            {block.content.text}
          </h2>
        );
      } else {
        return (
          <h3 className="text-xl font-bold mb-4">
            {block.content.text}
          </h3>
        );
      }

    case 'paragraph':
      return (
        <p className="mb-4 leading-relaxed text-slate-800">
          {block.content.text}
        </p>
      );

    case 'quote':
      return (
        <blockquote className="border-l-4 border-slate-300 pl-6 my-6 italic text-lg text-slate-700" style={{ borderColor: 'var(--color-primary)' }}>
          <p className="mb-2">{block.content.text}</p>
          {block.content.author && (
            <cite className="text-sm text-slate-500 not-italic">
              — {block.content.author}
            </cite>
          )}
        </blockquote>
      );

    case 'list':
      const ListTag = block.content.ordered ? 'ol' : 'ul';
      return (
        <ListTag className={`mb-4 ${block.content.ordered ? 'list-decimal' : 'list-disc'} list-inside space-y-1`}>
          {(block.content.items || []).map((item: string, index: number) => (
            <li key={index} className="text-slate-800">{item}</li>
          ))}
        </ListTag>
      );

    case 'image':
      return (
        <figure className="my-8">
          {block.content.url && (
            <div className="rounded-xl overflow-hidden border border-slate-200/80 bg-slate-50/80 shadow-sm">
              <img
                src={block.content.url}
                alt={block.content.title || block.content.caption || 'Image'}
                className="w-full max-h-[28rem] object-contain"
              />
            </div>
          )}
          {(block.content.title || block.content.caption) && (
            <figcaption className="mt-3 space-y-1">
              {block.content.title && (
                <div className="font-semibold text-slate-900">{block.content.title}</div>
              )}
              {block.content.caption && (
                <div className="text-sm text-slate-500">{block.content.caption}</div>
              )}
            </figcaption>
          )}
        </figure>
      );

    case 'divider':
      return (
        <div className="my-8 flex justify-center">
          <div className="w-24 h-px bg-slate-300" />
        </div>
      );

    default:
      return null;
  }
}
