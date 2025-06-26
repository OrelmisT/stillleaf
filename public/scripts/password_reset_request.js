const error = document.querySelector('.error')
const closeBtn = document.querySelector('#close')


if(closeBtn){
    closeBtn.addEventListener("click", (e)=>{
        error.remove()
    })
}