export interface AuthBody{
    username: string;
    password: string;
}

export interface CategoryBody{
    title: string;
}

export interface NoteBody {
  title?: string;
  content?: string | null;
  category?: number | null;
}

export interface NoteUpdateBody {
  title?: string;
  content?: string;
}