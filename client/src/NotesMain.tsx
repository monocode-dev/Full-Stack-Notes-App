import NotesGrid from './Notes/NotesGrid'
import NoteModal from './Notes/NoteModal'
import type { Category, Note } from './types'


interface NotesMainProps {
  data: Note[];
  filteredCategory: number | "all";
  categories: Category[];
  onOpenNewNoteModal: () => void;
  onOpenEditNoteModal: (note: Note) => void;
  onCloseModal: () => void;
  modalMode: "new" | "edit" | null;
  selectedNote: Note | null;
  onAddNote: (note: {
    title: string;
    category: number;
    content: string; 
  }) => void;
  onEditNote: (note: {
    id: number;
    title: string;
    content: string;
  }) => void;
  onDeleteNote: (id: number) => void;
}

export default function NotesMain({data, 
                                  filteredCategory, 
                                  onOpenEditNoteModal,
                                  onOpenNewNoteModal, 
                                  onCloseModal, 
                                  modalMode, 
                                  categories, 
                                  selectedNote, 
                                  onAddNote, 
                                  onEditNote, 
                                  onDeleteNote}: NotesMainProps) {
  return (
    <main className="notes-main">
      <div className="notes-toolbar">
        <div className="toolbar-label">
          <span className="eyebrow">Viewing</span>
          <h1>All Notes</h1>
        </div>
        <button className="btn btn-primary" onClick={onOpenNewNoteModal}>+ New note</button>
      </div>

      <NotesGrid data={data} 
                  filteredCategory={filteredCategory}
                  categories={categories}
                  onDeleteNote={onDeleteNote}
                  onOpenEditNoteModal={onOpenEditNoteModal} />

      <NoteModal  onCloseModal={onCloseModal}
                  modalMode={modalMode} 
                  categories={categories} 
                  onAddNote={onAddNote}
                  onEditNote={onEditNote}
                  selectedNote={selectedNote} />
    </main>
  );
}