const form = document.querySelector('form')
if(form){

    const [passwordInput, passwordConfirmInput] = document.querySelectorAll('input')
    
    form.addEventListener('submit', (e)=>{
        if(passwordInput.value !== passwordConfirmInput.value){
            e.preventDefault()
            passwordConfirmInput.setCustomValidity("Passwords don't match")
            passwordConfirmInput.reportValidity()
        } else{
            passwordConfirmInput.setCustomValidity('')
        }
    })
    

}