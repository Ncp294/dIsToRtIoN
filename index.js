// initialize application
const express = require('express');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const app = express();
const port = 8080;
const path = require('path');

app.use(express.static('public'));
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('/data/database.db', { readonly: false });

// create user data table
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        password TEXT NOT NULL,
        username TEXT NOT NULL,
        name TEXT NOT NULL,
        posts TEXT DEFAULT (json_array())
    );
`);

// create post data table
db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        author TEXT NOT NULL
    );
`);

// set up multer image storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "/data/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

// define max upload
const maxSize = 1 * 1000 * 1000;

// multer config
const upload = multer({
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: function (req, file, cb) {
        const fileTypes = /jpeg|jpg|png/;
        const mimeType = fileTypes.test(file.mimetype);
        const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

        if ( mimeType && extName ) {
            return cb(null, true);
        }

        cb("File upload only supports the following types: " + fileTypes);
    }
});

// redirect main entrypoint to home page
app.get('/', (req, res) => {
    res.redirect('/home');
});

// send post data to home page and render
app.get('/home', (req, res) => {
    let posts = db.prepare('SELECT * FROM posts').all();

    const currentUser = checkLogin(req);

    res.render('home', {
        'posts': posts,
        'user': currentUser
    });
});

// render register page
app.get('/register', (req, res) => {
    let taken = false;
    const from = req.get('Referrer');
    if ( from && from.includes('register')) {
        taken = true;
    }
    res.render('register', {
        "taken": taken
    });
});

// register and redirect new users
app.post('/register', (req, res) => {
    let username = req.body['username'];
    let password = req.body['password'];
    let name = req.body['name'];

    if ( username == '' || password == '' || name == '' ) {
        res.render('register', {
            "taken": "empty"
        });
        return;
    }

    const attemptedUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if ( attemptedUser ) {
        res.redirect('register');
    } else {
        db.prepare('INSERT INTO users (username, password, name) VALUES (?, ?, ?)').run(username, password, name);
        res.redirect('login');
    }
});

// render login page
app.get('/login', (req, res) => {
    let registering = false;
    const from = req.get('Referrer');
    if ( from && from.includes('register')) {
        registering = true;
    }

    res.render('login', {
        "registering": registering
    });
});

// verify and redirect login attempts
app.post('/login', (req, res) => {
    let username = req.body['username'];
    let password = req.body['password'];

    const currentUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (currentUser.password !== password) {
        res.render('login', {
            "registering": "incorrect"
        });
    } else {
        res.cookie('username', currentUser.username, {maxAge: 3600000});
        res.cookie('password', currentUser.password, {maxAge: 3600000});
        res.redirect('home');
    }
});

app.get('/logout', (req, res) => {
    res.clearCookie('username');
    res.clearCookie('password');

    res.redirect('home');
});

// render posting page
app.get('/post', (req, res) => {
    const currentUser = checkLogin(req);

    if ( !currentUser ) {
        res.render('login', {
            "registering": "post"
        });
    } else {
        res.render('post', {
            'user': currentUser
        });
    }
});

app.post('/post', upload.single('mypic'), (req, res) => {
    const currentUser = checkLogin(req);
    const fileName = req.file.filename;

    db.prepare('INSERT INTO posts (content, author) VALUES (?, ?)').run(fileName, currentUser.username);
    db.prepare('UPDATE users SET posts = json_insert(posts, \'$[#]\', ?) WHERE username = ?').run(fileName, currentUser.username);

    res.redirect('home');
});

app.get('/profile/:username', (req, res) => {
    const username = req.params.username;
    const currentUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    const posts = db.prepare('SELECT * FROM posts WHERE author = ?').all(username);
    console.log(posts);
 
    if ( !currentUser ) {
        res.send("User not found. Try again.");
    } else {
        res.render('profile', {
            'user': currentUser,
            'posts': posts
        });
    }
});

// open app on designated port
app.listen(port, () => {
    console.log("Now listening on port " + port + "...");
});

function checkLogin(req) {
    const username = req.cookies.username;
    const password = req.cookies.password;
    let currentUser = undefined;

    if ( username ) {
        currentUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    }

    if ( !username || !password || !currentUser || password !== currentUser.password ) {
        return undefined;
    }

    return currentUser;
}