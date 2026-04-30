const userData = document.getElementById('userData');
let taken = userData.dataset.taken;

if ( taken == "true" ) {
    alert("Username taken, try a new one.");
} else if ( taken == "empty" ) {
    alert("One or more fields left blank. Please enter all info.");
}