import express, { Request, Response, NextFunction } from "express";
import {AuthBody, CategoryBody, NoteBody, NoteUpdateBody} from "./types/requests";
import session from "express-session";
import db, { User, Category, Note } from "./database";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config()

const SqliteStoreFactory = require("better-sqlite3-session-store");
const SqliteStore = SqliteStoreFactory(session);

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.static('public'));
app.use(express.json());
app.use(session({
    store: new SqliteStore({client: db, expired: {clear: true, intervalMs: 15*60*1000 }}),
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 }
}));

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
        const addUser = db
                        .prepare('INSERT INTO users (username, password) VALUES (?, ?)')
                        .run(username, hashedPass);
        
        req.session.loggedIn = true;
        req.session.username = username;
        req.session.userId = addUser.lastInsertRowid as number;
        
        return res.status(201).json({ success: true, message: 'User Added Successfully'});


    } catch (err) {
        return res.status(400).json({success: false, message: 'Username Already Exists'});
    };
});

app.post('/login', async (req: Request<{}, {}, AuthBody>, res: Response) => {
    const {username, password} = req.body;

    const user = db
                .prepare('SELECT * FROM users WHERE username = ?')
                .get(username) as User | undefined;

    if(!user){
        return res.status(401).json({success: false, message: "Invalid username or password"});
    }

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

app.get('/api/categories', requirelogin, (req: Request, res: Response) => {
    try{
        const selectAll = db
                         .prepare('SELECT * FROM categories WHERE user_id = ?')
                         .all(req.session.userId) as Category[];
        return res.json({success: true, data: selectAll});
    }catch(err) {
        return res.status(500).json({success: false, message: 'Server Error, Please try again'});
    }
});

app.post('/api/categories', requirelogin, (req: Request<{}, {}, CategoryBody>, res: Response) => {
    const {title} = req.body;

    if (!title){
        return res.status(400).json({success: false, message: 'Title is required'});
    }

    try{
        const addCategory = db.prepare('INSERT INTO categories (title, user_id) VALUES (?, ?)');
        const info = addCategory.run(title, req.session.userId);

        const createdCategory: Category = {
            id: info.lastInsertRowid as number,
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

app.delete('/api/categories/:id', requirelogin, (req: Request<{id: string}, {}, {}>, res: Response) =>{
    const id = req.params.id

    try {
        const deleteCategory = db
                              .prepare('DELETE FROM categories WHERE id = ? AND user_id = ?')
                              .run(id, req.session.userId);

        if (deleteCategory.changes === 0){
            return res.status(404).json({success: false, message:'Category Not Found'});
        }

        return res.status(200).json({success: true, message: 'Category Deleted Successfully'});
    } catch (err) {
        return res.status(500).json({success: false, message:'Server Error, Please try again'});
    }
});

app.get('/api/notes', requirelogin, (req: Request, res: Response) => {
    try {
        let selectAll: Note[];

        if(typeof req.query.category === "string"){
            selectAll = db
                        .prepare('SELECT * FROM notes WHERE user_id = ? AND category_id = ?')
                        .all(req.session.userId, req.query.category) as Note[];
        }else{
            selectAll = db
                        .prepare('SELECT * FROM notes WHERE user_id = ?')
                        .all(req.session.userId) as Note[];
        }
        return res.json({success: true, data: selectAll});
    } catch (error) {
        return res.status(500).json({success: false, message:'Server Error, Please try again'});
    }
});

app.post('/api/notes', requirelogin, (req: Request<{}, {}, NoteBody>, res: Response) => {
    let {title, content, category} = req.body;

    if(!title) title = 'Untitled';
    if(!category) category = null;
    if(!content) content = null;

    try {
        const addNote = db
                        .prepare('INSERT INTO notes (title, content, user_id, category_id) VALUES (?, ?, ?, ?)');
        const info = addNote
                    .run(title, content, req.session.userId, category);

        const addedNote: Note = {
            id: info.lastInsertRowid as number,
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

app.put('/api/notes/:id', requirelogin, (req: Request<{id: string}, {}, NoteUpdateBody>, res: Response) => {
    const { title, content } = req.body;
    const id = req.params.id
    
    try {
        if (title === undefined && content === undefined) {
            return res.status(400).json({ success: false, message: 'No update data provided' });
        }

        let info;
        if (title !== undefined && content !== undefined) {
            info = db
                   .prepare('UPDATE notes SET title = ?, content = ? WHERE id = ? AND user_id = ?')
                   .run(title, content, id, req.session.userId);
        } else if (title !== undefined) {
            info = db
                   .prepare('UPDATE notes SET title = ? WHERE id = ? AND user_id = ?')
                   .run(title, id, req.session.userId);
        } else {
            info = db
                .prepare('UPDATE notes SET content = ? WHERE id = ? AND user_id = ?')
                .run(content, id, req.session.userId);
        }

        if (info.changes === 0) {
            return res.status(404).json({ success: false, message: 'Problem Occurred or Note Not Found' });
        }

        return res.status(200).json({ success: true, message: 'Updated Note Successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error, Please try again' });
    }
});

app.delete('/api/notes/:id', requirelogin, (req: Request<{id: string}, {}, {}>, res: Response) => {
    try {
        const deleteNote = db
                           .prepare('DELETE FROM notes WHERE id = ? AND user_id = ?')
                           .run(req.params.id, req.session.userId);

        if(deleteNote.changes === 0){
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