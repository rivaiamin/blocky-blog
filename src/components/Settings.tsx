import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const FONT_OPTIONS = [
  { value: "Inter Variable, ui-sans-serif, system-ui, sans-serif", label: "Inter" },
  { value: "Georgia, ui-serif, serif", label: "Georgia" },
  { value: "'Source Serif 4', ui-serif, Georgia, serif", label: "Source Serif" },
  { value: "'JetBrains Mono', ui-monospace, monospace", label: "JetBrains Mono" },
  { value: "system-ui, -apple-system, sans-serif", label: "System" },
];

const DEFAULT_SETTINGS = {
  webName: "Personal Blog",
  hero: {
    title: "Welcome to My Blog",
    description: "Thoughts, stories, and ideas about technology, design, and life.",
    imageUrl: "",
    ctaLabel: "",
    ctaHref: "",
  },
  background: "#f9fafb",
  fontFamily: "Inter Variable, ui-sans-serif, system-ui, sans-serif",
  colorScheme: { primary: "#2563eb", secondary: "#64748b" },
};

interface SettingsProps {
  setCurrentView: (view: any) => void;
}

export function Settings({ setCurrentView }: SettingsProps) {
  const settings = useQuery(api.siteSettings.get);
  const updateSettings = useMutation(api.siteSettings.update);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    if (!settings) return;
    setForm({
      webName: settings.webName,
      hero: { ...DEFAULT_SETTINGS.hero, ...settings.hero },
      background: settings.background,
      fontFamily: settings.fontFamily,
      colorScheme: { ...DEFAULT_SETTINGS.colorScheme, ...settings.colorScheme },
    });
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({
        webName: form.webName,
        hero: form.hero,
        background: form.background,
        fontFamily: form.fontFamily,
        colorScheme: form.colorScheme,
      });
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (settings === undefined) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-slate-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold theme-text-primary mb-8">Frontpage settings</h1>

      <div className="space-y-6">
        <section className="theme-card bg-white/90 backdrop-blur-sm border border-slate-200/80 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Web name</h2>
          <input
            type="text"
            value={form.webName}
            onChange={(e) => setForm((f) => ({ ...f, webName: e.target.value }))}
            placeholder="Site name in header"
            className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none"
          />
        </section>

        <section className="theme-card bg-white/90 backdrop-blur-sm border border-slate-200/80 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Hero</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                type="text"
                value={form.hero.title}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    hero: { ...f.hero, title: e.target.value },
                  }))
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={form.hero.description}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    hero: { ...f.hero, description: e.target.value },
                  }))
                }
                rows={2}
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hero image URL</label>
              <input
                type="url"
                value={form.hero.imageUrl ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    hero: { ...f.hero, imageUrl: e.target.value || undefined },
                  }))
                }
                placeholder="https://..."
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">CTA button label</label>
                <input
                  type="text"
                  value={form.hero.ctaLabel ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      hero: { ...f.hero, ctaLabel: e.target.value || undefined },
                    }))
                  }
                  placeholder="e.g. Get started"
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">CTA link (optional)</label>
                <input
                  type="text"
                  value={form.hero.ctaHref ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      hero: { ...f.hero, ctaHref: e.target.value || undefined },
                    }))
                  }
                  placeholder="/dashboard or https://..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="theme-card bg-white/90 backdrop-blur-sm border border-slate-200/80 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Appearance</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Background</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={form.background}
                  onChange={(e) => setForm((f) => ({ ...f, background: e.target.value }))}
                  className="h-10 w-14 rounded-xl border border-slate-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={form.background}
                  onChange={(e) => setForm((f) => ({ ...f, background: e.target.value }))}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)]/30 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Font family</label>
              <select
                value={form.fontFamily}
                onChange={(e) => setForm((f) => ({ ...f, fontFamily: e.target.value }))}
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)]/30 outline-none"
              >
                {FONT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Primary color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={form.colorScheme.primary}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        colorScheme: { ...f.colorScheme, primary: e.target.value },
                      }))
                    }
                    className="h-10 w-14 rounded-xl border border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={form.colorScheme.primary}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        colorScheme: { ...f.colorScheme, primary: e.target.value },
                      }))
                    }
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)]/30 outline-none text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Secondary color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={form.colorScheme.secondary}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        colorScheme: { ...f.colorScheme, secondary: e.target.value },
                      }))
                    }
                    className="h-10 w-14 rounded-xl border border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={form.colorScheme.secondary}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        colorScheme: { ...f.colorScheme, secondary: e.target.value },
                      }))
                    }
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)]/30 outline-none text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setCurrentView({ type: "dashboard" })}
          className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="theme-btn px-6 py-2.5 theme-bg-primary text-white rounded-xl disabled:opacity-50 disabled:transform-none"
        >
          {saving ? "Saving..." : "Save settings"}
        </button>
      </div>
    </div>
  );
}
