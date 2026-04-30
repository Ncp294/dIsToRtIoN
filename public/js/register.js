const userData = document.getElementById('userData');
let taken = userData.dataset.taken;

if ( taken == "true" ) {
    alert("Username taken, try a new one.");
}