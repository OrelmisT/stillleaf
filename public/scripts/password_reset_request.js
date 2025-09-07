const error = document.querySelector('.error')
const closeBtn = document.querySelector('#close')


if(closeBtn){
    closeBtn.addEventListener("click", (e)=>{
        error.remove()
    })
}

const submit_btn = document.querySelector('#reset')
if(submit_btn){

    document.querySelector('form').addEventListener('submit', (e) =>{
        submit_btn.setAttribute('disabled', true)
        submit_btn.style.opacity = "50%"
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
