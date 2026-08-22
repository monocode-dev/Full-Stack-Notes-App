import { useState } from 'react';

interface NewCategoryFormProps {
  onAddCategory: (title: string) => void;
}

export default function NewCategoryForm({onAddCategory}: NewCategoryFormProps) {
  const [title, setTitle] = useState('');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    onAddCategory(title);
    setTitle('');
  }

  return (
    <form className="new-category-form" onSubmit={handleSubmit}>
      <input 
        type="text"
        className="new-category-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New category…"
        maxLength= {24}
      />
      <button type="submit" className="btn btn-brass btn-icon">+</button>
    </form>
  );
}