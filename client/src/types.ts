export interface Category {
  id: number;
  title: string;
  user_id: number | string;
}

export interface Note {
  id: number;
  title: string;
  content: string | null;
  user_id?: number | string;
  category_id: number | null;
}