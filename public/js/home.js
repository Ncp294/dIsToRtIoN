const userData = document.getElementById('userData');
let posts = JSON.parse(userData.dataset.posts);
console.log(posts);

for (let i = posts.length-1; i > -1; i--) {
    const post = posts[i];

    const auth = document.createTextNode(post.author);
    const cont = document.createTextNode(post.content);

    const div = document.createElement('div');
    const content = document.createElement('p');
    const author = document.createElement('h3');

    content.appendChild(cont);
    author.appendChild(auth);

    div.id = Math.floor(posts[i].id);

    div.appendChild(author);
    div.appendChild(content);

    document.getElementById('posts').appendChild(div);
}