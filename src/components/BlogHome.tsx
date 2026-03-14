import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface BlogHomeProps {
  setCurrentView: (view: any) => void;
}

export function BlogHome({ setCurrentView }: BlogHomeProps) {
  const posts = useQuery(api.posts.getPublishedPosts);
  const settings = useQuery(api.siteSettings.get);

  const hero = settings?.hero ?? {
    title: "Welcome to My Blog",
    description: "Thoughts, stories, and ideas about technology, design, and life.",
    imageUrl: "",
    ctaLabel: "",
    ctaHref: "",
  };

  const handleCtaClick = () => {
    const href = hero.ctaHref ?? "";
    if (href.startsWith("http")) {
      window.open(href, "_blank");
    } else if (href === "/dashboard" || href === "dashboard") {
      setCurrentView({ type: "dashboard" });
    } else if (href) {
      setCurrentView({ type: "dashboard" });
    }
  };

  const hasHeroImage = Boolean(hero.imageUrl?.trim());

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero: two-column when image present, else centered */}
      <section
        className={
          hasHeroImage
            ? "grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center mb-20 min-h-[28rem]"
            : "text-center mb-16"
        }
      >
        <div className={hasHeroImage ? "order-2 lg:order-1" : ""}>
          <h1
            className={
              hasHeroImage
                ? "text-4xl lg:text-5xl font-bold mb-4 theme-text-primary leading-tight"
                : "text-5xl font-bold mb-6 theme-text-primary"
            }
          >
            {hero.title}
          </h1>
          <p
            className={
              hasHeroImage
                ? "text-lg text-slate-600 mb-6 max-w-lg"
                : "text-xl max-w-2xl mx-auto text-slate-600"
            }
          >
            {hero.description}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {hero.ctaLabel && (
              <button
                type="button"
                onClick={handleCtaClick}
                className="theme-btn px-6 py-3 font-semibold text-white shadow-md theme-bg-secondary"
              >
                {hero.ctaLabel}
              </button>
            )}
            {hasHeroImage && (
              <button
                type="button"
                onClick={() => setCurrentView({ type: "dashboard" })}
                className="theme-text-primary font-medium hover:opacity-80 transition-opacity inline-flex items-center gap-1.5"
              >
                Know more
                <span className="text-amber-400" aria-hidden>✦</span>
              </button>
            )}
          </div>
        </div>
        {hasHeroImage && (
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="w-full max-w-lg overflow-hidden aspect-[4/3] lg:aspect-auto lg:min-h-[20rem]">
              <img
                src={hero.imageUrl}
                alt=""
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        )}
      </section>

      {posts === undefined ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-slate-600" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg theme-text-secondary">No posts published yet.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => (
            <article
              key={post._id}
              className="theme-card bg-white/90 backdrop-blur-sm border border-slate-200/80 p-8 cursor-pointer"
              onClick={() => setCurrentView({ type: "post", postId: post._id })}
            >
              <h2 className="text-2xl font-bold mb-3 hover:opacity-80 transition-opacity theme-text-primary">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="mb-4 line-clamp-3 text-slate-600">
                  {post.excerpt}
                </p>
              )}
              <div className="flex items-center justify-between text-sm theme-text-secondary">
                <span>{new Date(post._creationTime).toLocaleDateString()}</span>
                <span className="font-medium hover:opacity-80 transition-opacity theme-text-primary">
                  Read more →
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
