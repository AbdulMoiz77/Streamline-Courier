function getselectedValue(){
    let selection = document.getElementById('UserType')
    let individuals = document.getElementsByClassName('individual')
    let company = document.getElementsByClassName('company')

    let common = document.getElementsByClassName('common')
    for(element of common){
        element.value = ''
    }
    if (selection.value == 'company'){
        for (const indi of individuals){
            indi.style.display = 'none';
        }
        for (const comp of company){
            comp.style.display = ''
        }
    }
    if (selection.value == 'individual'){
        for (const indi of individuals){
            indi.style.display = '';
        }
        for (const comp of company){
            comp.style.display = 'none'
        }
    }
    console.log(selection.value)
}

getselectedValue()
document.getElementById('UserType').addEventListener('change',getselectedValue)
