// initialize application
const express = require('express');
const app = express();
const port = 8080;
const path = require('path');

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));

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
    let posts = db.prepare('SELECT * FROM posts').all();
    res.render('home', {
        'posts': posts
    });
});

// render register page
app.get('/register', (req, res) => {
    res.render('register');
});

// render login page
app.get('/login', (req, res) => {
    res.render('login');
});

// render user profile page
app.post('/welcome', (req, res) => {
    let username = req.body['username'];
    let password = req.body['password'];

    let from = req.get('Referrer');

    // if coming from registration, add user to db
    if (from.includes('register')) {
        //TODO: Make username specific
        console.log('registering');
        let name = req.body['name'];

        db.prepare('INSERT INTO users (username, password, name) VALUES (?, ?, ?)').run(username, password, name);

    // if coming from profile page, create post
    } else if (from.includes('welcome')) {
        let newPost = req.body['post'];
        db.prepare('INSERT INTO posts (content, author) VALUES (?, ?)').run(newPost, username);
        let post = db.prepare('SELECT * FROM posts WHERE content = ?').get(newPost);

        db.prepare('UPDATE users SET posts = json_insert(posts, \'$[#]\', ?) WHERE username = ?').run(post.id, username);
    }

    // get user info from db based on login
    let currentUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    // if correct password, render profile page
    if (currentUser.password !== password) {
        res.send("Wrong password, try again!");
    } else {
        res.render('welcome', {
            'user': currentUser
        });
    }
});

// open app on designated port
app.listen(port, () => {
    console.log("Now listening on port " + port + "...");
});