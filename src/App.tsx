import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { Dashboard } from "./components/Dashboard";
import { BlogHome } from "./components/BlogHome";
import { PostEditor } from "./components/PostEditor";
import { PostView } from "./components/PostView";
import { useState } from "react";
import { Id } from "../convex/_generated/dataModel";

export default function App() {
  const [currentView, setCurrentView] = useState<{
    type: 'home' | 'dashboard' | 'editor' | 'post';
    postId?: Id<"posts">;
    slug?: string;
  }>({ type: 'home' });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrentView({ type: 'home' })}
              className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              Personal Blog
            </button>
            <Authenticated>
              <button
                onClick={() => setCurrentView({ type: 'dashboard' })}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </button>
            </Authenticated>
          </div>
          <div className="flex items-center gap-4">
            <Authenticated>
              <SignOutButton />
            </Authenticated>
            <Unauthenticated>
              <button
                onClick={() => setCurrentView({ type: 'dashboard' })}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign In
              </button>
            </Unauthenticated>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Content currentView={currentView} setCurrentView={setCurrentView} />
      </main>
      
      <Toaster />
    </div>
  );
}

function Content({ 
  currentView, 
  setCurrentView 
}: { 
  currentView: { type: string; postId?: Id<"posts">; slug?: string };
  setCurrentView: (view: any) => void;
}) {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <Authenticated>
        {currentView.type === 'home' && (
          <BlogHome setCurrentView={setCurrentView} />
        )}
        {currentView.type === 'dashboard' && (
          <Dashboard setCurrentView={setCurrentView} />
        )}
        {currentView.type === 'editor' && (
          <PostEditor 
            postId={currentView.postId} 
            setCurrentView={setCurrentView} 
          />
        )}
        {currentView.type === 'post' && currentView.postId && (
          <PostView 
            postId={currentView.postId} 
            setCurrentView={setCurrentView} 
          />
        )}
      </Authenticated>

      <Unauthenticated>
        {currentView.type === 'home' && (
          <BlogHome setCurrentView={setCurrentView} />
        )}
        {currentView.type === 'post' && (currentView.postId || currentView.slug) && (
          <PostView 
            postId={currentView.postId} 
            slug={currentView.slug} 
            setCurrentView={setCurrentView} 
          />
        )}
        {(currentView.type === 'dashboard' || currentView.type === 'editor') && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in to continue</h2>
            <p className="text-gray-600 mb-8">You need to be signed in to access the dashboard and editor.</p>
            <SignInForm />
          </div>
        )}
      </Unauthenticated>
    </div>
  );
}
