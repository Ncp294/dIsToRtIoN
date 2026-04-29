// pull data passed in from database
const userData = document.getElementById('userData');
let posts = JSON.parse(userData.dataset.posts);

// iterate through all user posts
for (let i = posts.length-1; i > -1; i--) {
    const post = posts[i];

    // create text nodes
    const auth = document.createTextNode(post.author);
    const cont = document.createTextNode(post.content);

    // create DOM elements
    const div = document.createElement('div');
    const content = document.createElement('p');
    const author = document.createElement('h3');

    // nest DOM elements
    content.appendChild(cont);
    author.appendChild(auth);

    div.id = Math.floor(posts[i].id);

    div.appendChild(author);
    div.appendChild(content);

    document.getElementById('posts').appendChild(div);
}