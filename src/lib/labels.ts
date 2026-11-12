import type { InquiryStatus, ProductCategory, RequestType } from '@/types';

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  phone: 'موبايلات',
  screen: 'شاشات وقطع',
  case: 'جرابات',
  accessory: 'إكسسوارات',
};

export const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  repair: 'صيانة عطل',
  price: 'استفسار عن سعر',
  part: 'توفر قطعة',
  other: 'أخرى',
};

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  new: 'جديد',
  answered: 'تم الرد',
  closed: 'مغلق',
};

export const formatPrice = (value: number) =>
  `${new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 0 }).format(value)} ج.م`;

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
