import { useState } from "react";
import type { Category, Note } from '../types'

interface NoteModalProps {
  modalMode: "new" | "edit" | null;
  categories: Category[];
  selectedNote: Note | null;
  onCloseModal: () => void;
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
}

export default function NoteModal(props: NoteModalProps) {
  if (props.modalMode === null) return null;

  const formKey =
    props.modalMode === "edit" ? `edit-${props.selectedNote?.id}` : "new";

  return <NoteModalForm key={formKey} {...props} />;
}

function NoteModalForm({
  onCloseModal,
  modalMode,
  categories,
  onAddNote,
  onEditNote,
  selectedNote,
}: NoteModalProps) {
  const [title, setTitle] = useState(
    modalMode === "edit" ? selectedNote?.title ?? "" : ""
  );

  const [category, setCategory] = useState(
    modalMode === "edit"
      ? String(selectedNote?.category_id ?? "")
      : ""
  );

  const [content, setContent] = useState(
    modalMode === "edit" ? selectedNote?.content ?? "" : ""
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (modalMode === "new") {
      if (!category) return;

      onAddNote({
        title,
        category: Number(category),
        content: content,
      });
    } else if (modalMode === "edit") {
      if (!selectedNote) return;

      onEditNote({
        id: selectedNote.id,
        title,
        content,
      });
    }

    onCloseModal();
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{modalMode === "new" ? "New note" : "Edit note"}</h2>

          <button
            type="button"
            className="icon-btn"
            onClick={onCloseModal}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            required
          />

          {modalMode === "new" && (
            <>
              <label>Category</label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="" disabled>
                  Choose a category
                </option>

                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id as number | string}>
                    {cat.title}
                  </option>
                ))}
              </select>
            </>
          )}

          <label>Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Content"
          />

          <div className="modal-actions">
            <div className="modal-actions-right">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onCloseModal}
              >
                Cancel
              </button>

              <button type="submit" className="btn btn-primary">
                Save note
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
