import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { AdminLayout, PermissionGuard } from '../../../layouts/AdminLayout';
import { AdminPageHeader, ErrorBanner } from '../../../components/admin/ui';
import { CloudinaryImageField } from '../../../components/admin/CloudinaryImageField';
import { apiRequest } from '../../../services/api';
import { useAppDispatch } from '../../../app/hooks';
import { showToast } from '../../../features/notifications/toastSlice';
import type { BannerPlacement, BannerRecord } from '../../../types/commerce';
import { useSeoMeta } from '../../../lib/useSeoMeta';

export function BannerFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  useSeoMeta({ title: `${isEditing ? 'Edit' : 'Create'} Banner | NOVARA Admin`, noIndex: true });

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    eyebrow: '',
    subtitle: '',
    desktopImageUrl: '',
    mobileImageUrl: '',
    cloudinaryPublicId: '',
    placement: 'hero_bento' as BannerPlacement,
    theme: 'royal-blue' as 'royal-blue' | 'ice-blue' | 'midnight-navy',
    ctaText: 'Shop Now',
    destinationUrl: '/shop',
    priority: '0',
    startsAt: '',
    endsAt: '',
    isPublished: true,
  });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiRequest<{ ok: true; banner: BannerRecord }>(`/api/admin/banners/${id}`)
      .then((res) => {
        const b = res.banner;
        setForm({
          title: b.title || '',
          eyebrow: b.eyebrow || '',
          subtitle: b.subtitle || '',
          desktopImageUrl: b.desktopImageUrl || '',
          mobileImageUrl: b.mobileImageUrl || '',
          cloudinaryPublicId: b.cloudinaryPublicId || '',
          placement: b.placement || 'hero_bento',
          theme: b.theme || 'royal-blue',
          ctaText: b.ctaText || 'Shop Now',
          destinationUrl: b.destinationUrl || '/shop',
          priority: String(b.priority ?? 0),
          startsAt: b.startsAt ? b.startsAt.slice(0, 16) : '',
          endsAt: b.endsAt ? b.endsAt.slice(0, 16) : '',
          isPublished: b.isPublished !== false,
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load banner.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.title.trim() || !form.desktopImageUrl.trim()) {
      setError('Title and desktop image URL are required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        eyebrow: form.eyebrow.trim(),
        subtitle: form.subtitle.trim(),
        desktopImageUrl: form.desktopImageUrl.trim(),
        mobileImageUrl: form.mobileImageUrl.trim(),
        cloudinaryPublicId: form.cloudinaryPublicId || undefined,
        placement: form.placement,
        theme: form.theme,
        ctaText: form.ctaText.trim() || 'Shop Now',
        destinationUrl: form.destinationUrl.trim() || '/shop',
        priority: Number(form.priority || 0),
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
        isPublished: form.isPublished,
      };

      if (isEditing && id) {
        await apiRequest(`/api/admin/banners/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        dispatch(showToast({ variant: 'success', message: 'Banner updated.' }));
      } else {
        await apiRequest('/api/admin/banners', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        dispatch(showToast({ variant: 'success', message: 'Banner created.' }));
      }
      navigate('/admin/banners');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save banner.';
      setError(msg);
      dispatch(showToast({ variant: 'error', message: msg }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <PermissionGuard permission="cms.manage">
        <div className="space-y-5 max-w-4xl mx-auto">
          <AdminPageHeader
            title={isEditing ? 'Edit Promotional Banner' : 'Create Promotional Banner'}
            subtitle="Configure placement, gradient theme, responsive image assets, and campaign dates."
            breadcrumbs={[
              { label: 'Marketing' },
              { label: 'Banners', to: '/admin/banners' },
              { label: isEditing ? 'Edit' : 'Create' },
            ]}
            actions={
              <Link
                to="/admin/banners"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E4EAF5] dark:border-slate-700 bg-white dark:bg-[#0B1730] px-3.5 py-2 text-xs font-semibold"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Banners
              </Link>
            }
          />

          {error && <ErrorBanner message={error} />}

          {loading ? (
            <div className="h-64 animate-pulse rounded-2xl border border-[#E4EAF5] bg-white" />
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-[#E4EAF5] dark:border-slate-800 bg-white dark:bg-[#0B1730] p-6 space-y-4 shadow-xs"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Eyebrow Label</label>
                  <input
                    value={form.eyebrow}
                    onChange={(e) => setForm((f) => ({ ...f, eyebrow: e.target.value }))}
                    placeholder="Big Sale"
                    className="w-full h-10 rounded-xl border border-[#E4EAF5] dark:border-slate-700 bg-[#F8FAFF] dark:bg-slate-900 px-3 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Banner Title *</label>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="UP TO 70% OFF"
                    className="w-full h-10 rounded-xl border border-[#E4EAF5] dark:border-slate-700 bg-[#F8FAFF] dark:bg-slate-900 px-3 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Subtitle</label>
                <input
                  value={form.subtitle}
                  onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                  placeholder="Fashion · Tech · Lifestyle"
                  className="w-full h-10 rounded-xl border border-[#E4EAF5] dark:border-slate-700 bg-[#F8FAFF] dark:bg-slate-900 px-3 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Placement</label>
                  <select
                    value={form.placement}
                    onChange={(e) => setForm((f) => ({ ...f, placement: e.target.value as BannerPlacement }))}
                    className="w-full h-10 rounded-xl border border-[#E4EAF5] dark:border-slate-700 bg-[#F8FAFF] dark:bg-slate-900 px-3 text-xs"
                  >
                    <option value="hero_bento">Hero Bento Card</option>
                    <option value="homepage_mid">Homepage Mid</option>
                    <option value="homepage_bottom">Homepage Bottom</option>
                    <option value="category_top">Category Top</option>
                    <option value="promo_strip">Promo Strip</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Card Theme</label>
                  <select
                    value={form.theme}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, theme: e.target.value as 'royal-blue' | 'ice-blue' | 'midnight-navy' }))
                    }
                    className="w-full h-10 rounded-xl border border-[#E4EAF5] dark:border-slate-700 bg-[#F8FAFF] dark:bg-slate-900 px-3 text-xs"
                  >
                    <option value="royal-blue">Royal Blue</option>
                    <option value="ice-blue">Ice Blue</option>
                    <option value="midnight-navy">Midnight Navy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Priority</label>
                  <input
                    type="number"
                    value={form.priority}
                    onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-[#E4EAF5] dark:border-slate-700 bg-[#F8FAFF] dark:bg-slate-900 px-3 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">CTA Text *</label>
                  <input
                    required
                    value={form.ctaText}
                    onChange={(e) => setForm((f) => ({ ...f, ctaText: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-[#E4EAF5] dark:border-slate-700 bg-[#F8FAFF] dark:bg-slate-900 px-3 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Destination URL *</label>
                  <input
                    required
                    value={form.destinationUrl}
                    onChange={(e) => setForm((f) => ({ ...f, destinationUrl: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-[#E4EAF5] dark:border-slate-700 bg-[#F8FAFF] dark:bg-slate-900 px-3 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CloudinaryImageField
                  label="Desktop Image *"
                  folder="banners"
                  value={form.desktopImageUrl}
                  onChange={(url, publicId) =>
                    setForm((f) => ({ ...f, desktopImageUrl: url, cloudinaryPublicId: publicId ?? f.cloudinaryPublicId }))
                  }
                />
                <CloudinaryImageField
                  label="Mobile Image (Optional)"
                  folder="banners"
                  value={form.mobileImageUrl}
                  onChange={(url) => setForm((f) => ({ ...f, mobileImageUrl: url }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-xs font-semibold mb-1">Starts At</label>
                  <input
                    type="datetime-local"
                    value={form.startsAt}
                    onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-[#E4EAF5] dark:border-slate-700 bg-[#F8FAFF] dark:bg-slate-900 px-3 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Ends At</label>
                  <input
                    type="datetime-local"
                    value={form.endsAt}
                    onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-[#E4EAF5] dark:border-slate-700 bg-[#F8FAFF] dark:bg-slate-900 px-3 text-xs"
                  />
                </div>
                <label className="flex h-10 items-center gap-2 rounded-xl border border-[#E4EAF5] dark:border-slate-700 px-3.5 text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
                  />
                  <span>Publish to Storefront</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E4EAF5] dark:border-slate-800">
                <Link
                  to="/admin/banners"
                  className="rounded-xl border border-[#E4EAF5] dark:border-slate-700 px-4 py-2 text-xs font-semibold"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#145CFF] px-5 py-2 text-xs font-semibold text-white hover:bg-[#0E47D9] disabled:opacity-60"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{saving ? 'Saving...' : isEditing ? 'Update Banner' : 'Create Banner'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </PermissionGuard>
    </AdminLayout>
  );
}
