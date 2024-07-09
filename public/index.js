function track(){
    const id = document.getElementById('search').value
    if(id){
        window.location.href = 'track/track.html?id=' + id
    }
}

let login = document.getElementsByClassName('login')[0]

login.addEventListener('click', function() {
    window.location.href = 'login/login.html'
})

let signup = document.getElementsByClassName('signup')[0]
signup.addEventListener('click', function(){
    window.location.href = 'signup/signup.html'
})

document.addEventListener('DOMContentLoaded', () => {
    const contactHeader = document.querySelector('.contact-header');
    const contactForm = document.querySelector('.contact-form');
    const contactImages = document.querySelector('.contact-images');

    const observerOptions = {
        threshold: 0.1
    };

    const observerCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    observer.observe(contactHeader);
    observer.observe(contactForm);
    observer.observe(contactImages);
});

reveal = document.getElementById('reveal')
let container = document.getElementsByClassName('swift')[0]

reveal.addEventListener('click', function() {

    if(container.style.width == ''){
        container.style.width = '330px'; 
        reveal.style.borderRadius = '12px 0 0 12px'
        reveal.innerHTML = '<'
        reveal.style.left = 'auto'
        reveal.style.right = 0
        setTimeout(()=>{
                let link = document.querySelector('.swift a')
                link.style.opacity = '1';
                let content = document.querySelectorAll('.swift span');
                for(let i of content){
                    i.style.opacity = '1';
                }
        },2000)
    }else{
        setTimeout( ()=>{
            reveal.style.borderRadius = '0 12px 12px 0'
            reveal.innerHTML = '>'
            reveal.style.left = 0
        },2000)
        container.style.width = ''
        let link = document.querySelector('.swift a')
        link.style.opacity = '';
        let content = document.querySelectorAll('.swift span');
        for(let i of content){
            i.style.opacity = '';
        }
    }
});
