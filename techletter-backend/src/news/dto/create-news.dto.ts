export class CreateNewsDto {
  title!: string;
  subtitle?: string;
  content!: string;
  lead?: string;
  thumbnailUrl?: string;
  slug?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogImage?: string;
  sourceReferences?: {
    title?: string;
    url?: string;
    source?: string;
    type?: string;
    memo?: string;
  }[];
  status?: string;
  homeMain?: boolean;
  homeRecommended?: boolean;
  homeUrgent?: boolean;
  homeOrder?: number;
  scheduledAt?: Date;
  categoryId?: number;
  tags?: string[];
}
