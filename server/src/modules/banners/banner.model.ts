import mongoose, { Schema, type Document } from 'mongoose';

export type BannerPlacement =
  | 'hero_bento'
  | 'homepage_mid'
  | 'homepage_bottom'
  | 'category_top'
  | 'promo_strip';

export interface IBanner extends Document {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  desktopImageUrl: string;
  mobileImageUrl?: string;
  cloudinaryPublicId?: string;
  placement: BannerPlacement;
  theme: 'royal-blue' | 'ice-blue' | 'midnight-navy';
  ctaText: string;
  destinationUrl: string;
  priority: number;
  startsAt?: Date | null;
  endsAt?: Date | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema = new Schema<IBanner>(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    eyebrow: { type: String, trim: true, maxlength: 80 },
    subtitle: { type: String, trim: true, maxlength: 260 },
    desktopImageUrl: { type: String, required: true, trim: true },
    mobileImageUrl: { type: String, trim: true },
    cloudinaryPublicId: { type: String },
    placement: {
      type: String,
      enum: ['hero_bento', 'homepage_mid', 'homepage_bottom', 'category_top', 'promo_strip'],
      default: 'hero_bento',
      index: true,
    },
    theme: {
      type: String,
      enum: ['royal-blue', 'ice-blue', 'midnight-navy'],
      default: 'royal-blue',
    },
    ctaText: { type: String, default: 'Shop Now', trim: true, maxlength: 60 },
    destinationUrl: { type: String, default: '/shop', trim: true, maxlength: 300 },
    priority: { type: Number, default: 0, index: true },
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
    isPublished: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export const BannerModel = mongoose.models.Banner || mongoose.model<IBanner>('Banner', BannerSchema);
