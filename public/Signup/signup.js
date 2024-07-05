let selection = document.getElementById('UserType')
function getselectedValue(){
    let individuals = document.getElementsByClassName('individual')
    let company = document.getElementsByClassName('company')

    let common = document.getElementsByClassName('common')
    for(element of common){
        element.value = ''
    }
    if (selection.value == 'company'){
        document.querySelector('body').style.height = '100vh'
        for (const indi of individuals){
            indi.style.display = 'none';
            const input = indi.querySelector('input')
            if(input.hasAttribute('required')){
                input.removeAttribute('required')
            }
        }
        for (const comp of company){
            comp.style.display = ''
            const input  = comp.querySelector('input')
            if(input.id != 'fax'){
                input.setAttribute('required','')
            }
        }
    }
    if (selection.value == 'individual'){
        document.querySelector('body').style.height = '110vh'
        for (const indi of individuals){
            indi.style.display = '';
            const input  = indi.querySelector('input')
            if(input.id != 'altPhone' && input.id != 'empty'){
                input.setAttribute('required','')
            }          
        }
        for (const comp of company){
            comp.style.display = 'none'
            const input = comp.querySelector('input')
            if(input.hasAttribute('required')){
                input.removeAttribute('required')
            }
        }
    }
}

getselectedValue()
document.getElementById('UserType').addEventListener('change',getselectedValue)

const form = document.querySelector('form')


form.addEventListener('submit', (event)=>{
    event.preventDefault()

    const email = document.getElementById('email').value
    const address = document.getElementById('address').value
    const pass = document.getElementById('password').value
    const verifypass = document.getElementById('verifypass').value
    const phone = document.getElementById('phone').value

    const data = {email: email}
    fetch('/api/verifyEmail',{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if(!data.data){
            document.getElementById('dupEmail').style.display = ''
            setTimeout( ()=>{
                document.getElementById('dupEmail').style.display = 'none'            
            },3000)
        }else if(pass != verifypass){
            document.getElementById('notmatch').style.display = ''
            setTimeout( ()=>{
                document.getElementById('notmatch').style.display = 'none'
            },3000)
        }else if(/\D/.test(document.getElementById('phone').value) || /\D/.test(document.getElementById('altPhone').value) || /\D/.test(document.getElementById('fax').value)){
            document.getElementById('invPhone').style.display = ''
            setTimeout( ()=>{
                document.getElementById('invPhone').style.display = 'none'
            },3000)               
        }
        else if(selection.value  === 'individual'){
            const altPhone = document.getElementById('altPhone').value

            if(phone == altPhone){
                document.getElementById('samePhone').style.display = ''
                setTimeout( ()=>{
                    document.getElementById('samePhone').style.display = 'none'
                },3000)
                return
            }
            fetch('/api/verifyPhone', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({phone: phone})
            })
            .then(response => response.json())
            .then(data => {
                if(!data.data){
                    document.getElementById('dupPhone').style.display = ''
                    setTimeout( ()=>{
                        document.getElementById('dupPhone').style.display = 'none'            
                    },3000)
                    return
                }
                fetch('/api/verifyAltPhone', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({altPhone: altPhone})                        
                })
                .then(response => response.json())
                .then(data => {
                    if(!data.data){
                        document.getElementById('dupAltphone').style.display = ''
                        setTimeout( ()=>{
                        document.getElementById('dupAltphone').style.display = 'none'            
                        },3000)
                        return                           
                    }
                    const NIC = document.getElementById('NIC').value
                    fetch('/api/verifyNIC', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({NIC: NIC})  
                    })
                .then(response => response.json())
                .then(data =>{
                    if(!data.data){
                        document.getElementById('dupNIC').style.display = ''
                        setTimeout( ()=>{
                            document.getElementById('dupNIC').style.display = 'none'
                        },3000)
                        return
                    }
                    const customer = {password: pass, email: email, address: address, userType: selection.value}
                    fetch('/api/addCustomer', {
                            method:'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify(customer)
                    })
                    .then(response => response.json())
                    .then( data =>{
                        //adding indiidual customer
                        const custID = data.custID
                        console.log(custID)
                        const fname = document.getElementById('FirstName').value
                        const lname = document.getElementById('LastName').value
                        const indicustomer = {NIC: NIC, FirstName: fname, LastName: lname, custID: custID}
    
                        fetch('/api/addIndicustomer', {
                                method: 'POST',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify(indicustomer)
                        })
                        .catch( (error)=>{
                                console.log(error)
                        })

                        //adding phone number
                        const custphone = {custID: custID, Phone: phone, Alternate: altPhone}
                        fetch('/api/addPhoneNo' , {
                                method: 'POST',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify(custphone)
                        })
                        .catch( (error)=>{
                        console.log(error)
                        })
                            //account created
                        window.location.href = 'Success/correct.html?id=' + custID
                    })
                    .catch( (error)=>{
                            console.log(error)
                    })
                })
            })
        })
        }else if(selection.value == 'company'){
            const fax = document.getElementById('fax').value

            if(phone == fax){
                document.getElementById('sameFax').style.display = ''
                setTimeout( ()=>{
                    document.getElementById('sameFax').style.display = 'none'
                },3000)
                return
            }
            fetch('/api/verifyPhone', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({phone: phone})
            })
            .then(response => response.json())
            .then(data => {
                if(!data.data){
                    document.getElementById('dupPhone').style.display = ''
                    setTimeout( ()=>{
                        document.getElementById('dupPhone').style.display = 'none'            
                    },3000)
                    return
                }
            fetch('/api/verifyFaxNo', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({fax: fax})                        
            })
            .then(response => response.json())
            .then(data => {
                if(!data.data){
                    document.getElementById('dupFax').style.display = ''
                    setTimeout( ()=>{
                        document.getElementById('dupFax').style.display = 'none'            
                    },3000)
                    return                            
                }
                const compName = document.getElementById('CompName').value
                fetch('/api/verifyCompany', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({CompName: compName})  
                })
                .then(response => response.json())
                .then(data =>{
                    if(!data.data){
                        document.getElementById('dupCompName').style.display = ''
                        setTimeout( ()=>{
                            document.getElementById('dupCompName').style.display = 'none'
                        },3000)
                        return
                    }
                    console.log('Password: ',pass,'\nEmail:',email,'\nAddress:',address,'\nUserType:',selection.value,'\nCompName',compName, '\nPhone: ',phone,'\nFax:',fax)

                    const customer = {password: pass, email: email, address: address, userType: selection.value}
                    fetch('/api/addCustomer', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify(customer)
                    })
                    .then(response => response.json())
                    .then( data => {

                        //adding company custmer
                        const custID = data.custID
                        const focalper = document.getElementById('FocalPerson').value
                        const compCust = {compName: compName, FocalPerson: focalper, custID: custID}
                        fetch('/api/addCompCustomer', {
                                method: 'POST',
                                headers: {'Content-Type':'application/json'},
                                body: JSON.stringify(compCust)
                        })
                        .catch( (error)=>{
                                console.log(error)
                        })

                        //adding phone number
                        const custphone = {custID: custID, Phone: phone, Fax: fax}
                        fetch('/api/addCompPhoneNo', {
                                method: 'POST',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify(custphone)
                        })
                        .catch( (error) =>{
                            console.log(error)
                        })
    
                        //account created
                        window.location.href = 'Success/correct.html?id=' + custID

                    })
                    .catch( (error)=>{
                            console.log(error)
                    })
                })
            })
        })                   
    }
    })
    .catch((error)=>{
        console.log(error)
    })
})
