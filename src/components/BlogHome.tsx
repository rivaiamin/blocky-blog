import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface BlogHomeProps {
  setCurrentView: (view: any) => void;
}

export function BlogHome({ setCurrentView }: BlogHomeProps) {
  const posts = useQuery(api.posts.getPublishedPosts);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to My Blog
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Thoughts, stories, and ideas about technology, design, and life.
        </p>
      </div>

      {posts === undefined ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No posts published yet.</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {posts.map((post) => (
            <article
              key={post._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setCurrentView({ type: 'post', postId: post._id })}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
              )}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{new Date(post._creationTime).toLocaleDateString()}</span>
                <span className="text-blue-600 hover:text-blue-700">Read more →</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
