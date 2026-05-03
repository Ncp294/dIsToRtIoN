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
    const imgDiv = document.createElement('div');

    author.style.marginLeft = "2%";

    // nest DOM elements
    content.src = "data/" + post.content;
    author.appendChild(auth);
    imgDiv.appendChild(content);
    imgDiv.style.position = 'relative';

    div.id = Math.floor(posts[i].id);

    div.appendChild(author);
    div.appendChild(imgDiv);

    div.classList.add('post');

    document.getElementById('posts').appendChild(div);
}

// create the glitch look
// TODO: look into displaying corrupt images if time allots
const images = document.getElementsByTagName('img');
const maxRect = 6; // max number of rects put on top of each image

for (let i = 0; i < images.length; i++) {
    images[i].onload = () => {
        // get bounds of each image to create elements on top of them
        const rect = images[i].getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;

        for (let j = 0; j < maxRect; j++) {
            const rectangle = document.createElement('div');
            rectangle.classList.add('glitch');
            // make half of them across width and half across length
            let width, height, x, y;
            if (Math.random() > 0.5) {
                width = w;
                x = 0;
                height = Math.random() * h / 4;
                y = Math.max(Math.random() * h - height);
            } else {
                width = Math.random() * w / 6;
                x = Math.max(0, Math.random() * w - width);
                height = h;
                y = 0;
            }

            rectangle.style.width = width + 'px';
            rectangle.style.height = height + 'px';
            rectangle.style.left = x + 'px';
            rectangle.style.top = y + 'px';

            images[i].parentElement.appendChild(rectangle);
        }
    }
}