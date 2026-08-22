import getCategoryColor from '../Categorycolor'

interface CategoryItemProps {
  id: number | string | undefined | null;
  title: string;
  isActive: boolean;
  onSelectCategory: () => void; 
  onDeleteCategory: (id: number | string | undefined | null) => void;
}

export default function CategoryItem({id, 
                                      title, 
                                      isActive,
                                      onSelectCategory, 
                                      onDeleteCategory}: CategoryItemProps ){
  const color = getCategoryColor(id);
  return (
    <li className={`category-item ${isActive ? 'is-active' : ''}`} style={{ '--cat-color': color } as React.CSSProperties} >
      <button className="category-tab" onClick={onSelectCategory}>
        <span className="tab-dot" aria-hidden="true"></span>
        <span className="tab-label">{title}</span>
      </button>
      <button className="category-delete-btn" onClick={() => onDeleteCategory(id)} aria-label={`Delete ${title}`}>×</button>
    </li>
  );
}