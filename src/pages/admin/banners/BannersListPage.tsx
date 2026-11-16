import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit3, ImagePlus, Plus, Trash2 } from 'lucide-react';
import { AdminLayout, PermissionGuard } from '../../../layouts/AdminLayout';
import {
  AdminPageHeader,
  DataTable,
  EmptyStateCard,
  ErrorBanner,
  SearchFilterBar,
  StatusBadge,
} from '../../../components/admin/ui';
import { ConfirmDialog } from '../../../components/ui/Modal';
import { ResilientImage } from '../../../components/ui/ResilientImage';
import { apiRequest } from '../../../services/api';
import { useAppDispatch } from '../../../app/hooks';
import { showToast } from '../../../features/notifications/toastSlice';
import type { BannerRecord } from '../../../types/commerce';
import { useSeoMeta } from '../../../lib/useSeoMeta';

export function BannersListPage() {
  useSeoMeta({ title: 'Banners Management | NOVARA Admin', noIndex: true });
  const dispatch = useAppDispatch();

  const [banners, setBanners] = useState<BannerRecord[]>([]);
  const [search, setSearch] = useState('');
  const [placementFilter, setPlacementFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BannerRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadBanners = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (search.trim()) qs.set('q', search.trim());
      if (placementFilter) qs.set('placement', placementFilter);
      if (statusFilter) qs.set('status', statusFilter);
      const res = await apiRequest<{ ok: true; banners: BannerRecord[] }>(`/api/admin/banners?${qs.toString()}`);
      setBanners(res.banners || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load banners.');
    } finally {
      setLoading(false);
    }
  }, [search, placementFilter, statusFilter]);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiRequest(`/api/admin/banners/${deleteTarget.id}`, { method: 'DELETE' });
      dispatch(showToast({ variant: 'success', message: 'Banner deleted.' }));
      setDeleteTarget(null);
      loadBanners();
    } catch (err) {
      dispatch(showToast({ variant: 'error', message: err instanceof Error ? err.message : 'Delete failed.' }));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <PermissionGuard permission="cms.manage">
        <div className="space-y-4 max-w-[1440px] mx-auto">
          <AdminPageHeader
            title="Promotional Banners"
            subtitle="Manage storefront bento promo cards, category highlights, and campaign strips."
            breadcrumbs={[{ label: 'Marketing' }, { label: 'Banners' }]}
            actions={
              <Link
                to="/admin/banners/new"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#145CFF] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#0E47D9]"
              >
                <Plus className="h-4 w-4" /> Add Banner
              </Link>
            }
          />

          <SearchFilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search banner title, eyebrow, subtitle..."
            filters={
              <div className="flex flex-wrap gap-2">
                <select
                  value={placementFilter}
                  onChange={(e) => setPlacementFilter(e.target.value)}
                  className="h-9 rounded-xl border border-[#E4EAF5] dark:border-slate-700 bg-[#F4F7FF] dark:bg-slate-900 px-3 text-xs"
                >
                  <option value="">All Placements</option>
                  <option value="hero_bento">Hero Bento Cards</option>
                  <option value="homepage_mid">Homepage Mid</option>
                  <option value="homepage_bottom">Homepage Bottom</option>
                  <option value="category_top">Category Top</option>
                  <option value="promo_strip">Promo Strip</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 rounded-xl border border-[#E4EAF5] dark:border-slate-700 bg-[#F4F7FF] dark:bg-slate-900 px-3 text-xs"
                >
                  <option value="">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            }
          />

          {error && <ErrorBanner message={error} onRetry={loadBanners} />}

          <DataTable<BannerRecord>
            rows={banners}
            rowKey={(b) => b.id}
            loading={loading}
            emptyState={
              <EmptyStateCard
                icon={<ImagePlus className="h-6 w-6" />}
                title="No promotional banners found"
                description="Create responsive promo bento cards and storefront banners linked to live campaigns."
                action={
                  <Link
                    to="/admin/banners/new"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#145CFF] px-4 py-2 text-xs font-semibold text-white"
                  >
                    <Plus className="h-4 w-4" /> Create Banner
                  </Link>
                }
              />
            }
            columns={[
              {
                key: 'banner',
                header: 'Banner',
                render: (b) => (
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-16 shrink-0 overflow-hidden rounded-xl border border-[#E4EAF5] dark:border-slate-700 bg-[#F4F7FF] dark:bg-slate-900">
                      <ResilientImage src={b.desktopImageUrl} alt={b.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      {b.eyebrow && <div className="text-[10px] font-bold uppercase text-[#145CFF]">{b.eyebrow}</div>}
                      <div className="font-semibold text-[#101B35] dark:text-white truncate">{b.title}</div>
                      <div className="text-[11px] text-[#64748B] dark:text-slate-400 truncate max-w-xs">{b.destinationUrl}</div>
                    </div>
                  </div>
                ),
              },
              {
                key: 'placement',
                header: 'Placement',
                render: (b) => <StatusBadge label={b.placement.replace(/_/g, ' ')} tone="blue" />,
              },
              {
                key: 'theme',
                header: 'Theme',
                render: (b) => <span className="text-xs capitalize text-[#64748B] dark:text-slate-300">{b.theme.replace('-', ' ')}</span>,
              },
              {
                key: 'priority',
                header: 'Priority',
                align: 'center',
                render: (b) => <span className="font-mono-tabular font-semibold">{b.priority}</span>,
              },
              {
                key: 'status',
                header: 'Status',
                render: (b) => (
                  <StatusBadge label={b.isPublished ? 'Published' : 'Draft'} tone={b.isPublished ? 'emerald' : 'amber'} />
                ),
              },
              {
                key: 'actions',
                header: 'Actions',
                align: 'right',
                render: (b) => (
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      to={`/admin/banners/${b.id}/edit`}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#E4EAF5] dark:border-slate-700 px-2.5 py-1.5 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-[#145CFF]" /> Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(b)}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 dark:border-rose-900/50 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                ),
              },
            ]}
          />

          <ConfirmDialog
            open={Boolean(deleteTarget)}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
            title="Delete Banner"
            message={`Delete banner "${deleteTarget?.title}" permanently?`}
            confirmLabel="Delete"
            destructive
            loading={deleting}
          />
        </div>
      </PermissionGuard>
    </AdminLayout>
  );
}
