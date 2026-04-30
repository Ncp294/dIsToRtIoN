// initialize application
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const port = 8080;
const path = require('path');

app.use(express.static('public'));
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('database.db', { readonly: false });

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

// redirect main entrypoint to home page
app.get('/', (req, res) => {
    res.redirect('/home');
});

// send post data to home page and render
app.get('/home', (req, res) => {
    const username = req.cookies.username;
    const password = req.cookies.password;
    let currentUser = undefined;

    if ( username ){
        currentUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    }

    let posts = db.prepare('SELECT * FROM posts').all();

    if (!username || !password || password !== currentUser.password) {
        currentUser = undefined;
    }

    res.render('home', {
        'posts': posts,
        'user': currentUser
    });
});

// render register page
app.get('/register', (req, res) => {
    res.render('register');
});

// register and redirect new users
app.post('/register', (req, res) => {
    //TODO: Make username specific so no dupes
    let username = req.body['username'];
    let password = req.body['password'];
    let name = req.body['name'];

    db.prepare('INSERT INTO users (username, password, name) VALUES (?, ?, ?)').run(username, password, name);
    res.redirect('login');
});

// render login page
app.get('/login', (req, res) => {
    let registering = false;
    const from = req.get('Referrer');
    console.log(from);
    if (from.includes('register')) {
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
        res.send("Wrong password, try again!");
    } else {
        res.cookie('username', currentUser.username, {maxAge: 3600000});
        res.cookie('password', currentUser.password, {maxAge: 3600000});
        res.redirect('/home');
    }
});

// render posting page
app.get('/post', (req, res) => {
    // TODO: ensure user properly logged in
    const username = req.cookies.username;
    const password = req.cookies.password;

    const user = {
        username: username,
        password: password 
    };

    res.render('post', {
        'user': user
    });
});

app.post('/post', (req, res) => {
    let username = req.body['username'];
    let password = req.body['password'];

    let newPost = req.body['post'];
    db.prepare('INSERT INTO posts (content, author) VALUES (?, ?)').run(newPost, username);
    let post = db.prepare('SELECT * FROM posts WHERE content = ?').get(newPost);

    db.prepare('UPDATE users SET posts = json_insert(posts, \'$[#]\', ?) WHERE username = ?').run(post.id, username);
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