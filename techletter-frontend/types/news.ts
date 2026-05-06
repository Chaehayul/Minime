export interface News {
  id: number;
  title: string;
  summary: string;
  content?: string;
  thumbnail?: string;
  createdAt: string;
  views?: number;
  likesCount?: number;
  commentsCount?: number;
  category?: {
    id: number;
    name: string;
    slug?: string;
  };
  tags?: {
    id: number;
    name: string;
    slug?: string;
  }[];
  author?: {
    id: number;
    nickname: string;
  };
}