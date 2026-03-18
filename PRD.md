## PRD: Post Stories / Slideshow (Instagram-style)

### 1) Summary
Turn a standard blog post into an auto-playing **stories/slideshow** experience. Post content is split into **slides** using existing **divider** blocks. Slides play automatically with a progress indicator, support pause-on-hold, and use default Animate.css transitions (with reduced-motion support).

### 2) Goals
- **Slide-based post consumption** similar to Instagram Stories.
- **Zero-migration** content model using existing `divider` blocks as slide separators.
- **Autoplay** with intuitive controls (prev/next, pause).
- **Default animations** per slide + per block using Animate.css.
- **Accessibility**: respect `prefers-reduced-motion`.

### 3) Non-goals (v1)
- Author-defined per-slide duration.
- Audio, video, stickers, reactions, analytics.
- Full-screen modal/overlay viewer (current is embedded in page layout).
- Server-side rendering changes or schema changes.

### 4) Users & Use cases
- **Reader**: consume a post quickly as a sequence of slides.
- **Author**: create slides by inserting **Divider** blocks in the editor.

### 5) UX Requirements

#### 5.1 Slide splitting
- A post is split into slides by `divider` blocks.
- `divider` is **not shown** as content inside a slide.
- Edge cases:
  - leading divider: ignored
  - multiple dividers: no empty slides
  - no divider: render as normal article (non-stories)

#### 5.2 Stories playback
- **Autoplay**: 5 seconds per slide by default.
- **Progress UI**: segmented top bar, one segment per slide.
- **Navigation**
  - Tap/click **left third**: previous slide
  - Tap/click **right third**: next slide
  - Tap/click **middle third**: toggle pause/play (optional but included)
- **Pause behavior**: **press/hold (pointer down) pauses**, release resumes.
- **Keyboard**
  - `ArrowLeft` / `ArrowRight`: prev/next
  - `Space`: pause/play toggle
  - `Escape`: exit stories view

#### 5.3 Animations (default)
- **Slide enter**: Animate.css `fadeInRight`
- **Block enter**: Animate.css `fadeInUp` with stagger delay (e.g., 80ms increments)

#### 5.4 Reduced motion
If `prefers-reduced-motion: reduce`:
- Disable autoplay
- Disable animations
- Ensure content is still fully readable and navigable manually

### 6) Content Model / Data
- Use existing post schema: `posts.blocks[]`.
- Slide breaks are determined by blocks where `type === "divider"`.
- No Convex schema changes.

### 7) Functional Requirements (Acceptance Criteria)
- **AC1**: A post containing at least one `divider` renders in stories mode.
- **AC2**: Slides advance automatically every **5 seconds** when not paused.
- **AC3**: Holding pointer down pauses; releasing resumes.
- **AC4**: Left/right zones navigate prev/next; progress bar updates correctly.
- **AC5**: Slide transition and per-block animations apply by default.
- **AC6**: With reduced motion enabled, autoplay and animations are disabled.
- **AC7**: Posts without dividers render exactly as the current article view.

### 8) Technical Implementation Notes (as-built)
- Slide splitting utility: `src/lib/slides.ts`
- Stories viewer component: `src/components/PostStoriesView.tsx`
- Viewer selection: `src/components/PostView.tsx` switches to stories when `slides.length > 1`
- Animate.css integration: dependency + global import in `src/main.tsx`

### 9) Dependencies
- **animate.css** (runtime CSS dependency)

### 10) Open questions / Future enhancements
- Loop playback vs stop at last slide (currently stops/pauses at end).
- Add “Preview stories” from editor (planned as optional QoL).
- Per-slide duration, per-slide background, and richer media blocks.