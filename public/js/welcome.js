const userData = document.getElementById('userData');
let posts = JSON.parse(userData.dataset.posts);
posts = posts.replace('[', '').replace(']', '');
posts = posts.split(',');

renderPosts();

function renderPosts() {
    let htmlToAdd = '';
    for (let i = posts.length-1; i > -1; i--) {
        htmlToAdd += '<p>' + posts[i].replaceAll('"', '') + '</p><hr>';
        document.getElementById('pastPosts').innerHTML = htmlToAdd;
    }
}