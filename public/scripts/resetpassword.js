const form = document.querySelector('form')
if(form){

    const [passwordInput, passwordConfirmInput] = document.querySelectorAll('input')
    
    form.addEventListener('submit', (e)=>{
        if(passwordInput.value !== passwordConfirmInput.value){
            e.preventDefault()
            passwordConfirmInput.setCustomValidity("Passwords don't match")
            passwordConfirmInput.reportValidity()
        } else{
            const submit_btn = document.querySelector('button')
            submit_btn.setAttribute('disabled', true)
            submit_btn.style.opacity = "50%"
            passwordConfirmInput.setCustomValidity('')
        }
    })
    

}



const return_to_login = document.querySelector('#return_to_login')
if(return_to_login){
    return_to_login.addEventListener('click', (e) =>{
        window.location.href = '/login'
        return_to_login.setAttribute('disabled', true)
        return_to_login.style.opacity = "50%"
    })
}
