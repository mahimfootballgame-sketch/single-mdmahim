import { Router } from 'express';
import { requireDatabase } from '../../database/connection';
import { authenticateRequired, requirePermission } from '../../middleware/auth.middleware';
import {
  createBannerController,
  deleteBannerController,
  getBannerController,
  listBannersController,
  updateBannerController,
} from './banner.controller';

const router = Router();
router.use(requireDatabase, authenticateRequired);

router.get('/banners', requirePermission('cms.manage'), listBannersController);
router.get('/banners/:id', requirePermission('cms.manage'), getBannerController);
router.post('/banners', requirePermission('cms.manage'), createBannerController);
router.put('/banners/:id', requirePermission('cms.manage'), updateBannerController);
router.delete('/banners/:id', requirePermission('cms.manage'), deleteBannerController);

export default router;
