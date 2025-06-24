signUpLink = document.querySelector('#signUpLink')
signUpLink.addEventListener("click", (e) => {
    window.location.href = "/signup"
})

const error = document.querySelector('.error')
const closeBtn = document.querySelector('#close')


if(closeBtn){
    closeBtn.addEventListener("click", (e)=>{
        error.remove()
    })
}

