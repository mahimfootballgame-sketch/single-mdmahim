import { z } from 'zod';

export const bannerSchema = z.object({
  title: z.string().trim().min(2).max(140),
  eyebrow: z.string().trim().max(80).optional().default(''),
  subtitle: z.string().trim().max(260).optional().default(''),
  desktopImageUrl: z.string().trim().min(1),
  mobileImageUrl: z.string().trim().optional().default(''),
  cloudinaryPublicId: z.string().optional(),
  placement: z
    .enum(['hero_bento', 'homepage_mid', 'homepage_bottom', 'category_top', 'promo_strip'])
    .default('hero_bento'),
  theme: z.enum(['royal-blue', 'ice-blue', 'midnight-navy']).default('royal-blue'),
  ctaText: z.string().trim().min(1).max(60).default('Shop Now'),
  destinationUrl: z
    .string()
    .trim()
    .refine(
      (url) => url.startsWith('/') || url.startsWith('https://') || url.startsWith('http://'),
      'Destination URL must be a relative path or valid HTTP/HTTPS URL.',
    )
    .default('/shop'),
  priority: z.number().int().default(0),
  startsAt: z.string().nullable().optional(),
  endsAt: z.string().nullable().optional(),
  isPublished: z.boolean().default(true),
});

export type BannerInput = z.infer<typeof bannerSchema>;
