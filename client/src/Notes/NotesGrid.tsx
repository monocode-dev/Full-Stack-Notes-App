import NoteCard from "./NoteCard"
import type { Category, Note } from '../types'


interface NotesGridProps {
  data: Note[];
  filteredCategory: number | "all";
  categories: Category[];
  onDeleteNote: (id: number | string | undefined | null) => void;
  onOpenEditNoteModal: (note: Note) => void;
}

export default function NotesGrid({data, filteredCategory, categories, onDeleteNote, onOpenEditNoteModal}:NotesGridProps) {
  const filteredNotes = data.filter((note) => {
    if (filteredCategory === 'all') return true;
    return note.category_id === filteredCategory;
  });

  if (filteredNotes.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-title">Nothing filed here yet</p>
        <p className="empty-subtitle">Notes you add to this category will show up here.</p>
      </div>
    );
  }

  return (
    <div className="notes-grid">
      {filteredNotes.map((note) => {
        const chosenCategory = categories.find(
          (cat) => cat.id === note.category_id
        );
        return (
          <NoteCard key={note.id}
                    id={note.id}
                    title={note.title}
                    category={note.category_id ?? 0}
                    categoryTitle={chosenCategory?.title ?? ""}
                    content={note.content}
                    onOpenEditNoteModal={onOpenEditNoteModal}
                    onDeleteNote={onDeleteNote}/>
        );
      })}
    </div>
  );
}