// pull data passed in from database
const userData = document.getElementById('userData');
let posts = JSON.parse(userData.dataset.posts);
let user = userData.dataset.user;

const controlCenter = document.getElementById('controlCenter');
const regButton = document.getElementById('register');
const loginButton = document.getElementById('login');
const logoutButton = document.getElementById('logout');
const postButton = document.getElementById('post');

if (user) {
    user = JSON.parse(user);
    regButton.style.visibility = 'hidden';
    loginButton.style.visibility = 'hidden';
    logoutButton.style.visibility = 'visible';
    postButton.style.visibility = 'visible';
} else {
    regButton.style.visibility = 'visible';
    loginButton.style.visibility = 'visible';
    logoutButton.style.visibility = 'hidden';
    postButton.style.visibility = 'hidden';
}

// iterate through all user posts
for (let i = posts.length-1; i > -1; i--) {
    const post = posts[i];

    // create text nodes
    const auth = document.createTextNode(post.author);

    // create DOM elements
    const div = document.createElement('div');
    const content = document.createElement('img');
    const author = document.createElement('h3');

    author.style.marginLeft = "2%";

    // nest DOM elements
    content.src = "data/" + post.content;
    author.appendChild(auth);

    div.id = Math.floor(posts[i].id);

    div.appendChild(author);
    div.appendChild(content);

    div.classList.add('post');

    document.getElementById('posts').appendChild(div);
}