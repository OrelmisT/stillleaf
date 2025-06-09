signUpLink = document.querySelector('#loginLink')
signUpLink.addEventListener("click", (e) => {
    window.location.href = "/login"
})


const error = document.querySelector('.error')
const closeBtn = document.querySelector('#close')


if(closeBtn){
    closeBtn.addEventListener("click", (e)=>{
        error.remove()
    })
}
