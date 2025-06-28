const error = document.querySelector('.error')
const closeBtn = document.querySelector('#close')


if(closeBtn){
    closeBtn.addEventListener("click", (e)=>{
        error.remove()
    })
}

const submit_btn = document.querySelector('#reset')
document.querySelector('form').addEventListener('submit', (e) =>{
    submit_btn.setAttribute('disabled', true)
    submit_btn.style.opacity = "50%"
})
