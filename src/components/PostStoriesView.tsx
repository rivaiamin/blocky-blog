import { useEffect, useMemo, useRef, useState } from "react";
import { splitBlocksIntoSlides, type PostBlock } from "../lib/slides";
import { cn } from "../lib/utils";

type PostLike = {
  title: string;
  excerpt?: string | null;
  _creationTime: number;
  blocks?: PostBlock[] | null;
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mql.matches);
    onChange();
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, []);

  return reduced;
}

export function PostStoriesView({
  post,
  onExit,
  secondsPerSlide = 5,
}: {
  post: PostLike;
  onExit: () => void;
  secondsPerSlide?: number;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const slides = useMemo(() => splitBlocksIntoSlides(post.blocks), [post.blocks]);
  const durationMs = Math.max(1, secondsPerSlide * 1000);

  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1 for active slide

  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);

  const goTo = (nextIndex: number) => {
    const clamped = Math.max(0, Math.min(slides.length - 1, nextIndex));
    setActiveIndex(clamped);
    elapsedRef.current = 0;
    setProgress(0);
    lastTsRef.current = null;
  };

  const goNext = () => {
    if (activeIndex >= slides.length - 1) return;
    goTo(activeIndex + 1);
  };

  const goPrev = () => {
    if (activeIndex <= 0) return;
    goTo(activeIndex - 1);
  };

  useEffect(() => {
    if (slides.length === 0) return;
    if (reducedMotion) return; // no autoplay when reduced motion is enabled

    const tick = (ts: number) => {
      if (!paused) {
        const last = lastTsRef.current ?? ts;
        const delta = ts - last;
        lastTsRef.current = ts;
        elapsedRef.current += delta;
        const nextProgress = Math.min(1, elapsedRef.current / durationMs);
        setProgress(nextProgress);
        if (nextProgress >= 1) {
          if (activeIndex < slides.length - 1) {
            goTo(activeIndex + 1);
          } else {
            setPaused(true);
          }
        }
      } else {
        lastTsRef.current = ts;
      }
      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length, reducedMotion, paused, activeIndex, durationMs]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") onExit();
      if (e.key === " ") setPaused((p) => !p);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, slides.length, onExit]);

  const activeSlide = slides[activeIndex] ?? [];

  if (slides.length === 0) {
    return (
      <div className="theme-card bg-white/90 backdrop-blur-sm border border-slate-200/80 p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xl font-bold theme-text-primary">{post.title}</div>
            {post.excerpt && <div className="text-slate-600 mt-1">{post.excerpt}</div>}
          </div>
          <button
            onClick={onExit}
            className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
        <div className="mt-6 text-slate-600">No content.</div>
      </div>
    );
  }

  const slideEnterClass = reducedMotion
    ? ""
    : "animate__animated animate__faster animate__fadeInRight";

  return (
    <div className="relative mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-lg font-semibold theme-text-primary truncate">{post.title}</div>
          <div className="text-xs theme-text-secondary">
            {new Date(post._creationTime).toLocaleDateString()} · {activeIndex + 1}/{slides.length}
          </div>
        </div>
        <button
          onClick={onExit}
          className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          Close
        </button>
      </div>

      <div className="flex gap-1 mb-3">
        {slides.map((_, i) => {
          const fill =
            i < activeIndex ? 1 : i > activeIndex ? 0 : reducedMotion ? 1 : progress;
          return (
            <div
              key={i}
              className="h-1 flex-1 rounded-full bg-slate-200 overflow-hidden"
              aria-hidden="true"
            >
              <div
                className="h-full bg-slate-900/70"
                style={{ width: `${Math.round(fill * 100)}%` }}
              />
            </div>
          );
        })}
      </div>

      <div
        className={cn(
          "theme-card relative bg-white/90 backdrop-blur-sm border border-slate-200/80 overflow-hidden",
          "min-h-112 md:min-h-128",
        )}
        onPointerDown={() => setPaused(true)}
        onPointerUp={() => setPaused(false)}
        onPointerCancel={() => setPaused(false)}
        onPointerLeave={() => setPaused(false)}
      >
        <div className="absolute inset-0 grid grid-cols-3 z-20">
          <button
            type="button"
            className="h-full w-full cursor-pointer"
            aria-label="Previous slide"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
          />
          <button
            type="button"
            className="h-full w-full cursor-pointer"
            aria-label={paused ? "Play" : "Pause"}
            onClick={(e) => {
              e.stopPropagation();
              setPaused((p) => !p);
            }}
          />
          <button
            type="button"
            className="h-full w-full cursor-pointer"
            aria-label="Next slide"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
          />
        </div>

        <div className="relative z-10 p-8 lg:p-10">
          <div key={activeIndex} className={slideEnterClass}>
            <div className="prose prose-lg max-w-none">
              {activeSlide.map((block, i) => (
                <div
                  key={block.id}
                  className={
                    reducedMotion
                      ? ""
                      : "animate__animated animate__faster animate__fadeInUp"
                  }
                  style={
                    reducedMotion
                      ? undefined
                      : {
                          animationDelay: `${i * 80}ms`,
                          animationFillMode: "both",
                        }
                  }
                >
                  <BlockDisplay block={block} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-3 left-0 right-0 z-30 flex items-center justify-center gap-2 text-xs text-slate-600">
          {!reducedMotion && (
            <div className="rounded-full bg-white/80 border border-slate-200 px-3 py-1 shadow-sm">
              {paused ? "Paused" : "Playing"} · Hold to pause
            </div>
          )}
          {reducedMotion && (
            <div className="rounded-full bg-white/80 border border-slate-200 px-3 py-1 shadow-sm">
              Reduced motion enabled
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BlockDisplay({ block }: { block: PostBlock }) {
  switch (block.type) {
    case "heading": {
      const level = block.content?.level || 2;
      if (level === 1) return <h1 className="text-3xl font-bold mb-4">{block.content.text}</h1>;
      if (level === 2) return <h2 className="text-2xl font-bold mb-4">{block.content.text}</h2>;
      return <h3 className="text-xl font-bold mb-4">{block.content.text}</h3>;
    }
    case "paragraph":
      return <p className="mb-4 leading-relaxed text-slate-800">{block.content?.text}</p>;
    case "quote":
      return (
        <blockquote
          className="border-l-4 border-slate-300 pl-6 my-6 italic text-lg text-slate-700"
          style={{ borderColor: "var(--color-primary)" }}
        >
          <p className="mb-2">{block.content?.text}</p>
          {block.content?.author && (
            <cite className="text-sm text-slate-500 not-italic">— {block.content.author}</cite>
          )}
        </blockquote>
      );
    case "list": {
      const ListTag = block.content?.ordered ? "ol" : "ul";
      return (
        <ListTag
          className={cn(
            "mb-4 list-inside space-y-1",
            block.content?.ordered ? "list-decimal" : "list-disc",
          )}
        >
          {(block.content?.items || []).map((item: string, index: number) => (
            <li key={index} className="text-slate-800">
              {item}
            </li>
          ))}
        </ListTag>
      );
    }
    case "image":
      return (
        <figure className="my-8">
          {block.content?.url && (
            <div className="rounded-xl overflow-hidden border border-slate-200/80 bg-slate-50/80 shadow-sm">
              <img
                src={block.content.url}
                alt={block.content.title || block.content.caption || "Image"}
                className="w-full max-h-112 object-contain"
              />
            </div>
          )}
          {(block.content?.title || block.content?.caption) && (
            <figcaption className="mt-3 space-y-1">
              {block.content?.title && (
                <div className="font-semibold text-slate-900">{block.content.title}</div>
              )}
              {block.content?.caption && (
                <div className="text-sm text-slate-500">{block.content.caption}</div>
              )}
            </figcaption>
          )}
        </figure>
      );
    case "divider":
      return null;
    default:
      return null;
  }
}

