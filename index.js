const express = require('express');
const app = express();
const port = 8080;
const path = require('path');

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(port, () => {
    console.log("Now listening on port " + port + "...");
});