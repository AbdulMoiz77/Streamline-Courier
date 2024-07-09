let login = document.getElementsByClassName('login')[0]

login.addEventListener('click', function() {
    window.location.href = '../login/login.html'
})

let signup = document.getElementsByClassName('signup')[0]
signup.addEventListener('click', function(){
    window.location.href = '../signup/signup.html'
})

function fetchpk(id){
    const package = {packageID: id}
    fetch('/api/trackPackage', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(package)
    })
    .then(response => response.json())
    .then(data => {
        if(data.status){
            const packageID = data.data[0].packageID
            const pickup = data.data[0].pickup_time
            const timestamp = data.data[0].delivery_time
            const pk_status = data.data[0].status

            document.querySelector('.package h1 span').innerHTML = packageID 

            const estimatedTime = new Date(pickup)
            estimatedTime.setDate(estimatedTime.getDate() + 1)
            const estimatedTime_formatted = estimatedTime.toLocaleString('en-us',{
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
                hour12: true
            })
            const date = new Date(timestamp)
            const formatted_date = date.toLocaleString('en-us',{
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
                hour12: true
            })

            document.querySelector('.date p span').innerHTML = formatted_date
            const confirm = document.getElementById('confirm')
            const picked = document.getElementById('pickup')
            const out = document.getElementById('out for')
            const deliver = document.getElementById('deliver')
            const progress = document.getElementById('progress')


            if(pk_status == 'confirmed'){
                document.querySelector('.date p span').innerHTML = estimatedTime_formatted
                confirm.classList.remove('inactive')
                confirm.classList.add('active')

                picked.classList.remove('active')
                picked.classList.add('inactive')

                out.classList.remove('active')
                out.classList.add('inactive')

                deliver.classList.remove('active')
                deliver.classList.add('inactive')

                progress.style.setProperty('--progress-width', '0%')

            }else if(pk_status == 'picked up'){
                document.querySelector('.date p span').innerHTML = estimatedTime_formatted
                confirm.classList.remove('inactive')
                confirm.classList.add('active')

                picked.classList.remove('inactive')
                picked.classList.add('active')

                out.classList.remove('active')
                out.classList.add('inactive')

                deliver.classList.remove('active')
                deliver.classList.add('inactive')

                progress.style.setProperty('--progress-width', '25%')

            }else if(pk_status == 'out for delivery'){
                confirm.classList.remove('inactive')
                confirm.classList.add('active')

                picked.classList.remove('inactive')
                picked.classList.add('active')

                out.classList.remove('inactive')
                out.classList.add('active')

                deliver.classList.remove('active')
                deliver.classList.add('inactive')

                progress.style.setProperty('--progress-width', '53%')

            }else if(pk_status == 'delivered'){
                const para = document.querySelector('.date p')
                const span = document.querySelector('.date p span')

                const spanHTML = span.outerHTML

                para.innerHTML = 'Arrived On: '+ spanHTML
                
                confirm.classList.remove('inactive')
                confirm.classList.add('active')

                picked.classList.remove('inactive')
                picked.classList.add('active')

                out.classList.remove('inactive')
                out.classList.add('active')

                deliver.classList.remove('inactive')
                deliver.classList.add('active')

                progress.style.setProperty('--progress-width', '80%')
            }else{
                const para = document.querySelector('.date p')
                const span = document.querySelector('.date p span')

                const spanHTML = span.outerHTML
                para.innerHTML = 'Estimated Arrival: '+ spanHTML
                document.querySelector('.date p span').innerHTML = 'to be determined'
                confirm.classList.remove('active')
                confirm.classList.add('inactive')

                picked.classList.remove('active')
                picked.classList.add('inactive')

                out.classList.remove('active')
                out.classList.add('inactive')

                deliver.classList.remove('active')
                deliver.classList.add('inactive')

                progress.style.setProperty('--progress-width', '0%')
            }
        }else{
            document.querySelector('.package h1 span').innerHTML = ''
            document.querySelector('.date p span').innerHTML = ''
            document.getElementById('invPk').style.display = ''
            setTimeout( ()=>{
                document.getElementById('invPk').style.display = 'none'
            },4000)
        }
    })
}

document.addEventListener('DOMContentLoaded', function() {
    const url = new URLSearchParams(window.location.search)
    const id = url.get('id')
    if(id){
        fetchpk(id)
    }
})


function search(){
    const id = document.getElementById('search').value
    if(id){
        fetchpk(id)
    }
}

