import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Layers, Plus, Save, Trash2 } from 'lucide-react';
import { AdminLayout, PermissionGuard } from '../../../layouts/AdminLayout';
import { AdminPageHeader, ErrorBanner, LoadingCards } from '../../../components/admin/ui';
import { apiRequest } from '../../../services/api';
import { useAppDispatch } from '../../../app/hooks';
import { showToast } from '../../../features/notifications/toastSlice';
import { useSeoMeta } from '../../../lib/useSeoMeta';

interface HomepageSectionItem {
  key: string;
  title: string;
  subtitle?: string;
  enabled: boolean;
  sortOrder: number;
  productIds: string[];
}

export function HomepageSectionsPage() {
  useSeoMeta({ title: 'Homepage Sections | NOVARA Admin', noIndex: true });
  const dispatch = useAppDispatch();

  const [sections, setSections] = useState<HomepageSectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest<{ ok: true; config: { homepageSections?: HomepageSectionItem[] } }>('/api/admin/cms/homepage');
      setSections(
        (res.config?.homepageSections || []).map((s, idx) => ({
          key: s.key || `section_${idx + 1}`,
          title: s.title || '',
          subtitle: s.subtitle || '',
          enabled: Boolean(s.enabled ?? true),
          sortOrder: Number(s.sortOrder ?? idx),
          productIds: Array.isArray(s.productIds) ? s.productIds : [],
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load homepage sections.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addSection = () => {
    setSections((prev) => [
      ...prev,
      {
        key: `custom_section_${Date.now().toString(36).slice(-4)}`,
        title: 'Curated Picks',
        subtitle: 'Hand-selected gear for everyday efficiency',
        enabled: true,
        sortOrder: prev.length,
        productIds: [],
      },
    ]);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = sections.map((s, i) => ({
        key: s.key.trim(),
        title: s.title.trim(),
        subtitle: s.subtitle?.trim() || undefined,
        enabled: Boolean(s.enabled),
        sortOrder: Number(s.sortOrder ?? i),
        productIds: s.productIds,
      }));
      await apiRequest('/api/admin/cms/homepage', {
        method: 'PUT',
        body: JSON.stringify({ homepageSections: payload }),
      });
      dispatch(showToast({ variant: 'success', message: 'Homepage sections saved.' }));
      load();
    } catch (err) {
      dispatch(showToast({ variant: 'error', message: err instanceof Error ? err.message : 'Save failed.' }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <PermissionGuard permission="cms.manage">
        <div className="space-y-5 max-w-[1040px] mx-auto">
          <AdminPageHeader
            title="Homepage Sections"
            subtitle="Configure custom homepage product shelves, display order, and enabled status."
            breadcrumbs={[{ label: 'Content Management' }, { label: 'Homepage Sections' }]}
            actions={
              <button
                type="button"
                onClick={addSection}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#145CFF] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0E47D9]"
              >
                <Plus className="h-4 w-4" /> Add Section
              </button>
            }
          />

          {error && <ErrorBanner message={error} onRetry={load} />}
          {loading ? (
            <LoadingCards count={2} />
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="rounded-2xl border border-[#E4EAF5] dark:border-slate-800 bg-white dark:bg-[#0B1730] p-5 shadow-xs space-y-3">
                {sections.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#64748B]">
                    <Layers className="mx-auto mb-2 h-6 w-6 text-[#145CFF]" />
                    No custom homepage sections defined. Click "Add Section" to create a curated shelf.
                  </div>
                ) : (
                  sections.map((sec, idx) => (
                    <div
                      key={idx}
                      className="grid gap-3 sm:grid-cols-[160px_1fr_1fr_80px_auto] items-end rounded-xl border border-[#E4EAF5] dark:border-slate-800 bg-[#F8FAFF] dark:bg-slate-900/50 p-3.5"
                    >
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-[#64748B]">Section Key *</label>
                        <input
                          required
                          value={sec.key}
                          onChange={(e) =>
                            setSections((prev) => prev.map((r, i) => (i === idx ? { ...r, key: e.target.value } : r)))
                          }
                          className="w-full h-9 rounded-lg border border-[#E4EAF5] dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 font-mono-tabular text-xs"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-[#64748B]">Heading Title *</label>
                        <input
                          required
                          value={sec.title}
                          onChange={(e) =>
                            setSections((prev) => prev.map((r, i) => (i === idx ? { ...r, title: e.target.value } : r)))
                          }
                          className="w-full h-9 rounded-lg border border-[#E4EAF5] dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-[#64748B]">Subtitle</label>
                        <input
                          value={sec.subtitle || ''}
                          onChange={(e) =>
                            setSections((prev) => prev.map((r, i) => (i === idx ? { ...r, subtitle: e.target.value } : r)))
                          }
                          className="w-full h-9 rounded-lg border border-[#E4EAF5] dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-[#64748B]">Order</label>
                        <input
                          type="number"
                          value={sec.sortOrder}
                          onChange={(e) =>
                            setSections((prev) => prev.map((r, i) => (i === idx ? { ...r, sortOrder: Number(e.target.value) } : r)))
                          }
                          className="w-full h-9 rounded-lg border border-[#E4EAF5] dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 font-mono-tabular text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-2 pb-1">
                        <label className="inline-flex items-center gap-1.5 text-xs font-semibold">
                          <input
                            type="checkbox"
                            checked={sec.enabled}
                            onChange={(e) =>
                              setSections((prev) => prev.map((r, i) => (i === idx ? { ...r, enabled: e.target.checked } : r)))
                            }
                            className="h-4 w-4 rounded text-[#145CFF]"
                          />
                          Live
                        </label>
                        <button
                          type="button"
                          onClick={() => setSections((prev) => prev.filter((_, i) => i !== idx))}
                          className="rounded-lg border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#145CFF] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#0E47D9] disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Sections'}
                </button>
              </div>
            </form>
          )}
        </div>
      </PermissionGuard>
    </AdminLayout>
  );
}
