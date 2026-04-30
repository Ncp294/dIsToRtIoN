const userData = document.getElementById('userData');
let registering = userData.dataset.registering;

if ( registering == "true" ) {
    alert("Successfully registered!! Please log in.");
} else if ( registering == "incorrect") {
    alert("Incorrect username or password, please try again.");
} else if ( registering == "post" ) {
    alert("Please login in order to post.");
}