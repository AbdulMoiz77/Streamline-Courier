function getID(){
    const url = new URLSearchParams(window.location.search)
    const id = url.get('id')
    document.getElementById('IDplaceholder').innerText = id +'\nUse this ID to login'
}
window.onload = getID()

setTimeout(function() {
    document.querySelector('.checkmark').style.opacity = 1;
}, 2000);
