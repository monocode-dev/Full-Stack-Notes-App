import Sidebar from './Sidebar'
import NotesMain from './NotesMain'
import Login from './AuthenticationComps/Login'
import Signup from './AuthenticationComps/Signup'
import apiRequest from './utils'
import './style.css'
import { useState, useEffect } from 'react'

import type { Category, Note } from './types'
export type ModalMode = "new" | "edit" | null;
export type AuthView = "login" | "signup";

export default function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [authView, setAuthView] = useState<AuthView>("login");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  //Get Categories
  useEffect(() => {
    apiRequest<Category[]>('/api/categories')
    .then(response => {
      if(!response){
        setIsLoggedIn(false);
        return;
      }
      setIsLoggedIn(true);
      setCategories(response.data);
    })
  }, [])

  //Post Categories 
  function handleAddCategory(title: string){
    apiRequest<Category>('/api/categories', {method: 'POST', body: JSON.stringify({title})})
      .then(res => {
        if (!res) return;
        setCategories([...categories, res.data])
      })
  }

   //Filter Category 
  function handleCategory(filteredCategory: number | "all"){
    setSelectedCategory(filteredCategory)
  }

  //Delete Category 
  function handleDeleteCategory(category_id: number | null){
    apiRequest(`/api/categories/${category_id}`, {method: 'DELETE'})
    setCategories(prevCategories => {
      return prevCategories.filter(category => category.id !== category_id)
    });
  }

  //Get Notes
  useEffect(() => {
    apiRequest<Note[]>('/api/notes')
    .then(response => {
      if (response) setNotes(response.data);
    })
  }, [])

  //Post Notes
  function openNewNoteModal(){
    setModalMode('new');
    setSelectedNote(null);
  }

  function openEditNoteModal(note: Note){
    setModalMode('edit');
    setSelectedNote(note);
  }

  function closeModal(){
    setModalMode(null);
    setSelectedNote(null);
  }

  function handleAddNote(note: { title: string; category: number; content: string }){
    apiRequest<Note>('/api/notes', {method: 'POST', body: JSON.stringify(note)})
    .then(res => {
      if (!res) return;
      setNotes([...notes, res.data]);
    });
  }

  //Put Notes 
  function handleEditNote(note: { id: number ; title: string; content: string }){
    const {id, title, content} = note;

    apiRequest(`/api/notes/${id}`, {method: 'PUT', body: JSON.stringify({title, content})})
    setNotes(prevNotes => {
      return prevNotes.map(n => {
        return n.id === id ? { ...n, title: title, content: content } : n;
      });
    })
  }

  //Delete Notes
  function handleDeleteNote(note_id: number){
    apiRequest(`/api/notes/${note_id}`, {method: 'DELETE'})
    setNotes(prevNotes => {
      return prevNotes.filter(note => note.id !== note_id)
    });
  }

  //Log out
  function handleLogout() {
  apiRequest('/logout', { method: 'POST' }).then(() => {
    setIsLoggedIn(false);
  });
}


  //Authentication
  if(isLoggedIn === null){
    return(
      <p>Loading... </p>
    );
  }

  if(!isLoggedIn){
    return(
      authView === 'login' ?
      <Login onLogin={() => setIsLoggedIn(true) } onChangeAuthView={() => {setAuthView('signup')}} /> :
      <Signup onSignup={() => setIsLoggedIn(true) } onChangeAuthView={() => {setAuthView('login')}}/>
    );
  }

  return (
    <div className="app-view">
      <header className="app-header">
        <div className="header-left">
          <button className="icon-btn sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)} aria-label="Toggle categories">
            <span></span><span></span><span></span>
          </button>
          <span className="brand-mark brand-mark-sm">N</span>
          <span className="brand-name">Notebook</span>
        </div>
        <div className="header-right">
          <button className="btn btn-ghost" onClick={handleLogout}>Log out</button>
        </div>
      </header>

      <div className="app-body">
        <Sidebar 
          data={categories} 
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategory} 
          onAddCategory={handleAddCategory} 
          onDeleteCategory={handleDeleteCategory}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        {isSidebarOpen && <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)}></div>}
        
        <NotesMain data={notes} 
                    filteredCategory={selectedCategory} 
                    categories={categories} 
                    onOpenNewNoteModal={openNewNoteModal} 
                    onOpenEditNoteModal={openEditNoteModal} 
                    onCloseModal={closeModal} 
                    modalMode={modalMode} 
                    selectedNote={selectedNote}
                    onAddNote={handleAddNote} 
                    onEditNote={handleEditNote} 
                    onDeleteNote={handleDeleteNote} />
      </div>
  </div>
 );
}