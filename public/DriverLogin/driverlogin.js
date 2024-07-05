const form = document.querySelector('form')
const inputs = document.querySelectorAll('.input-box')
const errortags = document.getElementsByClassName('error')

form.addEventListener('submit', (event)=>{
    event.preventDefault()

    id = document.getElementById('Username').value
    const data = {name: id, password: document.getElementById('password').value
    }
    fetch('/api/Driverlogin',{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if(data.data){
            window.location.href = '../Driver/driver.html?id=' + id
        }else{
            user_icon = document.querySelector('.user-icon')
            pass_icon = document.querySelector('.password-icon')
            user_icon.style.display = 'none'
            pass_icon.style.display = 'none'
    
            for (let i=0; i<errortags.length; i++){
                errortags[i].style.display = 'block'
            }
            inputs[0].classList.add('shake')
            inputs[1].classList.add('shake')
    
            setTimeout( ()=>{
            user_icon.style.display = ''
            pass_icon.style.display = ''
            for (let i=0; i<errortags.length; i++){
                errortags[i].style.display = 'none'
            }
            inputs[0].classList.remove('shake')
            inputs[1].classList.remove('shake')
            },3000)
        }
    })
    .catch((error)=>{
        console.log(error)
    })
})
