
const username = localStorage.getItem('username')
const email = localStorage.getItem('email')

if(!email || !username){
    localStorage.clear()
    window.location.href = '/login'
}

const welcome_message = document.querySelector('h2')
welcome_message.textContent = `Welcome back, ${username}!`


document.querySelector('#logout').addEventListener('click', (e) =>{
    e.preventDefault()
    localStorage.clear()
    window.location.href = '/login'
})


document.querySelector('input[name="email"]').value = email


const error = document.querySelector('.error')
const closeBtn = document.querySelector('#close')


if(closeBtn){
    closeBtn.addEventListener("click", (e)=>{
        error.remove()
    })
}
