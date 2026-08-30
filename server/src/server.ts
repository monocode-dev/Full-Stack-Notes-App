import express, { Request, Response, NextFunction } from "express";
import {AuthBody, CategoryBody, NoteBody, NoteUpdateBody} from "./types/requests";
import session from "express-session";
import pool, {User, Category, Note} from "./database";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config()

import pgSession from "connect-pg-simple";

const app = express();

app.set('trust proxy', 1);
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
  session({
    store: new (pgSession(session))({
      pool,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 1000,
      secure: true,
      sameSite: "none",
    },
  })
);

const PORT = process.env.PORT || 3000;


app.use(express.static('public'));
app.use(express.json());

function requirelogin(req: Request, res: Response, next: NextFunction){
    if(!req.session.loggedIn){
        return res.status(401).json({success: false, message: 'Login is Required'});
    };
    next();
};

app.post('/signup', async (req: Request<{}, {}, AuthBody>, res: Response) =>{
    const {username, password} = req.body;

    if (!username || !password){
        return res.status(400).json({success: false, message: 'Please Enter a Username and Password'});
    };

    const hashedPass = await bcrypt.hash(password, 10);

    try{
        const result = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id', 
            [username, hashedPass]
        );
        
        req.session.loggedIn = true;
        req.session.username = username;
        req.session.userId = result.rows[0].id as number;
        
        return res.status(201).json({ success: true, message: 'User Added Successfully'});


    } catch (err) {
        return res.status(400).json({success: false, message: 'Username Already Exists'});
    };
});

app.post('/login', async (req: Request<{}, {}, AuthBody>, res: Response) => {
    const {username, password} = req.body;

    const result = await pool.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
    );

    if(result.rows.length === 0){
        return res.status(401).json({success: false, message: "Invalid username or password"});
    }

    const user = result.rows[0] as User;

    const comparePass = await bcrypt.compare(password, user.password);

    if(!comparePass){
        return res.status(401).json({success: false, message: 'Invalid username or password'});
    }

    req.session.loggedIn = true;
    req.session.username = username;
    req.session.userId = user.id;

    return res.status(200).json({success: true, message: 'Logged in Successfully'});
});

app.post('/logout', (req: Request, res: Response) => { 
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({success: false, message: 'Could not Log Out, Please try again'});
        }

        res.clearCookie('connect.sid');

        return res.status(200).json({success: true, message: 'logged out Successfully'});
    });
});

app.get('/api/categories', requirelogin, async (req: Request, res: Response) => {
    try{
        const result = await pool.query(
            'SELECT * FROM categories WHERE user_id = $1',
            [req.session.userId]
        )

        const selectAll = result.rows as Category[]
        
        return res.json({success: true, data: selectAll});
    }catch(err) {
        return res.status(500).json({success: false, message: 'Server Error, Please try again'});
    }
});

app.post('/api/categories', requirelogin, async (req: Request<{}, {}, CategoryBody>, res: Response) => {
    const {title} = req.body;

    if (!title){
        return res.status(400).json({success: false, message: 'Title is required'});
    }

    try{
        const result = await pool.query(
            'INSERT INTO categories (title, user_id) VALUES ($1, $2) RETURNING id',
            [title, req.session.userId]
        )

        const createdCategory: Category = {
            id: result.rows[0].id as number,
            title: title,
            user_id: req.session.userId as number
        };

        return res.status(201).json({success: true, 
                                    message: 'Category added Successfully',
                                    data: createdCategory});
    } catch(err){
        return res.status(500).json({success: false, message: 'Server Error, Please try again'});
    }
});

app.delete('/api/categories/:id', requirelogin, async (req: Request<{id: string}, {}, {}>, res: Response) =>{
    const id = req.params.id

    try {
        const result = await pool.query(
            'DELETE FROM categories WHERE id = $1 AND user_id = $2',
            [id, req.session.userId]
        );

        if (result.rowCount === 0){
            return res.status(404).json({success: false, message:'Category Not Found'});
        }

        return res.status(200).json({success: true, message: 'Category Deleted Successfully'});
    } catch (err) {
        return res.status(500).json({success: false, message:'Server Error, Please try again'});
    }
});

app.get('/api/notes', requirelogin, async (req: Request, res: Response) => {
    try {
        let selectedNotes: Note[];

        if(typeof req.query.category === "string"){
            const result = await pool.query(
                'SELECT * FROM notes WHERE user_id = $1 AND category_id = $2',
                [req.session.userId, req.query.category]
            );

            selectedNotes = result.rows as Note[]
        }else{
            const result = await pool.query(
                'SELECT * FROM notes WHERE user_id = $1',
                [req.session.userId]
            );

            selectedNotes = result.rows as Note[]
        }
        
        return res.json({success: true, data: selectedNotes});
    } catch (error) {
        return res.status(500).json({success: false, message:'Server Error, Please try again'});
    }
});

app.post('/api/notes', requirelogin, async (req: Request<{}, {}, NoteBody>, res: Response) => {
    let {title, content, category} = req.body;

    if(!title) title = 'Untitled';
    if(!category) category = null;
    if(!content) content = null;

    try {
        const result = await pool.query(
            'INSERT INTO notes (title, content, user_id, category_id) VALUES ($1, $2, $3, $4) RETURNING id',
            [title, content, req.session.userId, category]
        );

        const addedNote: Note = {
            id: result.rows[0].id as number,
            title: title,
            content: content,
            user_id: req.session.userId as number,
            category_id: category
        };

        return res.status(201).json({success: true, message: 'Note Added Successfully', data: addedNote});
    } catch (error) {
        return res.status(500).json({success: false, message:'Server Error, Please try again'});
    }
});

app.put('/api/notes/:id', requirelogin, async (req: Request<{id: string}, {}, NoteUpdateBody>, res: Response) => {
    const { title, content } = req.body;
    const id = req.params.id
    let info;
    
    try {
        if (title === undefined && content === undefined) {
            return res.status(400).json({ success: false, message: 'No update data provided' });
        }

        if (title !== undefined && content !== undefined) {
            const result = await pool.query(
                'UPDATE notes SET title = $1, content = $2 WHERE id = $3 AND user_id = $4',
                [title, content, id, req.session.userId]
            );
            info = result.rowCount

        } else if (title !== undefined) {
            const result = await pool.query(
                'UPDATE notes SET title = $1 WHERE id = $2 AND user_id = $3',
                [title, id, req.session.userId]
            );
            info = result.rowCount

        } else {
           const result = await pool.query(
                'UPDATE notes SET content = $1 WHERE id = $2 AND user_id = $3',
                [content, id, req.session.userId]
            );
            info = result.rowCount
        }

        if (info === 0) {
            return res.status(404).json({ success: false, message: 'Problem Occurred or Note Not Found' });
        }

        return res.status(200).json({ success: true, message: 'Updated Note Successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error, Please try again' });
    }
});

app.delete('/api/notes/:id', requirelogin, async (req: Request<{id: string}, {}, {}>, res: Response) => {
    try {
        const result = await pool.query(
            'DELETE FROM notes WHERE id = $1 AND user_id = $2',
            [req.params.id, req.session.userId]
        )

        if(result.rowCount === 0){
            return res.status(404).json({ success: false, message: 'Problem Occurred or Note Not Found' });
        }

        return res.status(200).json({ success: true, message: 'Deleted Note Successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error, Please try again' });
    }
});

app.listen(PORT, () => {
    console.log(`The server is running on http://localhost:${PORT}`);
});