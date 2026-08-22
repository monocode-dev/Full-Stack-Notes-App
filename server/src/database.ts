import Database from "better-sqlite3";

const db: Database.Database = new Database("saveFile.db")

db.pragma("foreign_keys = ON")

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(title, user_id)
    );

    CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT,
        user_id INTEGER NOT NULL,
        category_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );
`);

export default db;

export interface User{
    id: number;
    username: string;
    password: string;
}

export interface Category{
    id: number;
    title: string;
    user_id: number
}

export interface Note{
    id: number;
    title: string;
    content: string | null;
    user_id: number;
    category_id: number | null;
}