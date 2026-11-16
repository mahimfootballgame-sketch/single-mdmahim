import { BannerModel } from './banner.model';
import type { BannerInput } from './banner.validation';
import { AppError } from '../../middleware/error.middleware';

export async function listBanners(params: { q?: string; placement?: string; status?: string }) {
  const filter: Record<string, unknown> = {};
  if (params.placement) filter.placement = params.placement;
  if (params.status === 'published') filter.isPublished = true;
  if (params.status === 'draft') filter.isPublished = false;
  if (params.q) {
    const regex = new RegExp(params.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ title: regex }, { eyebrow: regex }, { subtitle: regex }];
  }
  const banners = await BannerModel.find(filter).sort({ priority: -1, updatedAt: -1 }).lean();
  return banners.map((b) => ({ ...b, id: String(b._id) }));
}

export async function getBannerById(id: string) {
  const banner = await BannerModel.findById(id).lean();
  if (!banner) throw new AppError(404, 'BANNER_NOT_FOUND', 'Banner not found.');
  return { ...banner, id: String(banner._id) };
}

export async function createBanner(input: BannerInput) {
  const banner = await BannerModel.create({
    ...input,
    startsAt: input.startsAt ? new Date(input.startsAt) : null,
    endsAt: input.endsAt ? new Date(input.endsAt) : null,
  });
  return { ...banner.toObject(), id: String(banner._id) };
}

export async function updateBanner(id: string, input: BannerInput) {
  const updated = await BannerModel.findByIdAndUpdate(
    id,
    {
      $set: {
        ...input,
        startsAt: input.startsAt ? new Date(input.startsAt) : null,
        endsAt: input.endsAt ? new Date(input.endsAt) : null,
      },
    },
    { new: true },
  );
  if (!updated) throw new AppError(404, 'BANNER_NOT_FOUND', 'Banner not found.');
  return { ...updated.toObject(), id: String(updated._id) };
}

export async function deleteBanner(id: string) {
  const banner = await BannerModel.findById(id);
  if (!banner) throw new AppError(404, 'BANNER_NOT_FOUND', 'Banner not found.');
  await banner.deleteOne();
  return { id };
}
