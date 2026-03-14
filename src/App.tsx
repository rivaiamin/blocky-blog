import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { Dashboard } from "./components/Dashboard";
import { BlogHome } from "./components/BlogHome";
import { PostEditor } from "./components/PostEditor";
import { PostView } from "./components/PostView";
import { Settings } from "./components/Settings";
import { useState } from "react";
import { Id } from "../convex/_generated/dataModel";

export default function App() {
  const settings = useQuery(api.siteSettings.get);
  const [currentView, setCurrentView] = useState<{
    type: 'home' | 'dashboard' | 'editor' | 'post' | 'settings';
    postId?: Id<"posts">;
    slug?: string;
  }>({ type: 'home' });

  const webName = settings?.webName ?? "Personal Blog";
  const defaultBg = "#f9fafb";
  const bg = settings?.background ?? defaultBg;
  const useGradient = !settings || bg === defaultBg;
  const themeStyle = {
    background: useGradient
      ? "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 22%, #fafafa 55%, #ffffff 100%)"
      : bg,
    fontFamily: settings?.fontFamily ?? undefined,
    ["--color-primary" as string]: settings?.colorScheme?.primary ?? "#2563eb",
    ["--color-secondary" as string]: settings?.colorScheme?.secondary ?? "#64748b",
  };

  return (
    <div className="min-h-screen" style={themeStyle}>
      <header className="sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <button
              onClick={() => setCurrentView({ type: 'home' })}
              className="text-xl font-bold theme-text-primary transition-all hover:opacity-80"
            >
              {webName}
            </button>
            <Authenticated>
              <nav className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentView({ type: 'dashboard' })}
                  className="px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView({ type: 'settings' })}
                  className="px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
                >
                  Settings
                </button>
              </nav>
            </Authenticated>
          </div>
          <div className="flex items-center gap-4">
            <Authenticated>
              <SignOutButton />
            </Authenticated>
            <Unauthenticated>
              <button
                onClick={() => setCurrentView({ type: 'dashboard' })}
                className="text-secondary font-semibold hover:text-secondary-hover transition-colors hover:shadow"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-log-in"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" x2="3" y1="12" y2="12"></line></svg>
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
        <div className="animate-spin h-8 w-8 border-2 border-slate-200 border-t-slate-600 rounded-full" />
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
        {currentView.type === 'settings' && (
          <Settings setCurrentView={setCurrentView} />
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
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign in to continue</h2>
            <p className="text-slate-600 mb-8">You need to be signed in to access the dashboard and editor.</p>
            <SignInForm />
          </div>
        )}
      </Unauthenticated>
    </div>
  );
}
