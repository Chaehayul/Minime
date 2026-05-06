export class UpdateNewsDto {
  title?: string;
  subtitle?: string;
  content?: string;
  lead?: string;
  thumbnailUrl?: string;
  slug?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogImage?: string;
  status?: string;
  scheduledAt?: Date;
  categoryId?: number;
  tags?: string[];
}