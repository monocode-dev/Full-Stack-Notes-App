import CategoryList from "./Categories/CategoryList"
import NewCategoryForm from "./Categories/NewCategoryForm"
import type { Category } from "./types";


interface SidebarProps {
  data: Category[];
  selectedCategory: number | "all";
  onSelectCategory: (filteredCategory: number | "all") => void;
  onAddCategory: (title: string) => void;
  onDeleteCategory: (category_id: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({data, 
                                 selectedCategory, 
                                 onSelectCategory, 
                                 onAddCategory, 
                                 onDeleteCategory, 
                                 isOpen, 
                                 onClose}: SidebarProps) {
  return (
    <aside className={`category-sidebar ${isOpen ? 'is-open' : ''}`}>
      <div className="sidebar-heading">
      <button className="icon-btn sidebar-close" onClick={onClose} aria-label="Close categories">×</button>
        <h2>Categories</h2>
        <span className="count-chip">{data.length}</span>
      </div>
      <CategoryList data={data} selectedCategory={selectedCategory} onSelectCategory={(id) => { onSelectCategory(id); onClose(); }} onDeleteCategory={onDeleteCategory} />
      <NewCategoryForm onAddCategory={onAddCategory} />
    </aside>
  );
}