import getCategoryColor from '../Categorycolor'
import type { Note } from '../types'

interface NoteCardProps {
  id: number | string | undefined | null;
  title: string;
  category: number;
  categoryTitle: string;
  content: string | null;
  onDeleteNote: (id: number | string | undefined | null) => void;
  onOpenEditNoteModal: (note: Note) => void;
}

export default function NoteCard({id, title, category, categoryTitle, content, onDeleteNote, onOpenEditNoteModal}: NoteCardProps) {
  const color = getCategoryColor(category);
  return (
    <article className="note-card" style={{ '--cat-color': color } as React.CSSProperties}>
      <header className="note-card-header">
        <span className="note-dot" aria-hidden="true"></span>
        <h3 className="note-title">{title}</h3>
      </header>
      {categoryTitle && <span className="note-category-label">{categoryTitle}</span>}
      <p className="note-preview">{content}</p>
      <footer className="note-card-footer">
        <div className="note-actions">
          <button className="icon-btn note-edit-btn" onClick={() => onOpenEditNoteModal({id, title, content, category_id: category})} aria-label="Edit note">✎</button>
          <button className="icon-btn note-delete-btn" onClick={() => onDeleteNote(id)} aria-label="Delete note">🗑</button>
        </div>
      </footer>
    </article>
  );
}