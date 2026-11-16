import type { Response, NextFunction } from 'express';
import { recordAuditLog, type AuthenticatedRequest } from '../../middleware/auth.middleware';
import { sendCreated, sendSuccess } from '../../utils/apiResponse';
import { bannerSchema } from './banner.validation';
import {
  createBanner,
  deleteBanner,
  getBannerById,
  listBanners,
  updateBanner,
} from './banner.service';

export async function listBannersController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const banners = await listBanners({
      q: String(req.query.q || '').trim(),
      placement: String(req.query.placement || '').trim(),
      status: String(req.query.status || '').trim(),
    });
    sendSuccess(res, { banners });
  } catch (err) {
    next(err);
  }
}

export async function getBannerController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const banner = await getBannerById(req.params.id);
    sendSuccess(res, { banner });
  } catch (err) {
    next(err);
  }
}

export async function createBannerController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const parsed = bannerSchema.parse(req.body);
    const banner = await createBanner(parsed);
    await recordAuditLog({
      actor: req.user,
      action: 'banner.create',
      resourceType: 'Banner',
      resourceId: banner.id,
      summary: `Created banner "${banner.title}" (${banner.placement})`,
    });
    sendCreated(res, { banner });
  } catch (err) {
    next(err);
  }
}

export async function updateBannerController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const parsed = bannerSchema.parse(req.body);
    const banner = await updateBanner(req.params.id, parsed);
    await recordAuditLog({
      actor: req.user,
      action: 'banner.update',
      resourceType: 'Banner',
      resourceId: banner.id,
      summary: `Updated banner "${banner.title}"`,
    });
    sendSuccess(res, { banner });
  } catch (err) {
    next(err);
  }
}

export async function deleteBannerController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = await deleteBanner(req.params.id);
    await recordAuditLog({
      actor: req.user,
      action: 'banner.delete',
      resourceType: 'Banner',
      resourceId: id,
      summary: `Deleted banner ${id}`,
    });
    sendSuccess(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}
