import { Pool } from "pg";
import dotenv from "dotenv"

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

export default pool;

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