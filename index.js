const express = require('express');
const app = express();
const port = 8080;
const path = require('path');

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));

const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('database.db', { readonly: false });

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        password TEXT NOT NULL,
        username TEXT NOT NULL,
        name TEXT NOT NULL,
        posts TEXT DEFAULT (json_array())
    );
`);

app.get('/', (req, res) => {
    res.redirect('/home');
});

app.get('/home', (req, res) => {
    res.render('home');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/welcome', (req, res) => {
    let username = req.body['username'];
    let password = req.body['password'];

    let from = req.get('Referrer');

    if (from.includes('register')) {
        console.log('registering');
        let name = req.body['name'];

        db.prepare('INSERT INTO users (username, password, name) VALUES (?, ?, ?)').run(username, password, name);
    } else if (from.includes('welcome')) {
        let newPost = req.body['post'];
        db.prepare('UPDATE users SET posts = json_insert(posts, \'$[#]\', ?) WHERE username = ?').run(newPost, username);
    }

    let currentUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    console.log(currentUser);

    if (currentUser.password !== password) {
        res.send("Wrong password, try again!");
    } else {
        res.render('welcome', {
            'user': currentUser
        });
    }
});

app.listen(port, () => {
    console.log("Now listening on port " + port + "...");
});