const burgerButton = document.querySelector('#hamburger')
const burgerSegments = document.querySelectorAll('.bar')
const navbar = document.querySelector('#navbar')
console.log(navbar)
burgerButton.addEventListener('click', (e) =>{
    if(burgerButton.classList.contains('rotateLeft')){
        burgerButton.classList.remove('rotateLeft')
        burgerButton.classList.add('rotateRight')
        navbar.classList.remove('slideIn')
        navbar.classList.add('slideOut')
        for(const segment of burgerSegments){
            segment.classList.remove('darken')
            segment.classList.add('lighten')
        }
       
    }else{
        burgerButton.classList.add('rotateLeft')
        burgerButton.classList.remove('rotateRight')
        navbar.classList.remove('slideOut')
        navbar.classList.add('slideIn')
        for(const segment of burgerSegments){
            segment.classList.remove('lighten')
            segment.classList.add('darken')
        }

    }
})

logout_btn = document.querySelector('#logout')
logout_btn.addEventListener("click", (e) => {
    localStorage.clear()
    window.location.href = '/logout'
})


const animateCreate = (e) =>{
    initializeRoutine(e.target)
    e.target.click()
    document.querySelector('#title-input').focus()

}


const createRoutine = async () =>{
    document.querySelector('#search-bar').value = ''
    document.querySelectorAll('.routine-li').forEach((routineli) => routineli.style.display='flex')
    const response = await fetch('/routines', {method:'POST', headers:{"Content-Type": 'application/json'}, body: JSON.stringify({title:''})})
    if(response.status === 201){
        const data = await response.json()
        const new_routine = document.createElement('div')
        new_routine.classList.add('routine-li')
        new_routine.setAttribute('data-selected', false)
        new_routine.setAttribute('data-routine_id', data.routine.id)
        new_routine.setAttribute('data-routine_title', data.routine.title)
        new_routine.innerHTML = `
            <div class='routine-li-content' >
                <p class='routine-li-title'>${data.routine.title ? data.routine.title : "Untitled"}</p>
            </div>
            <div class='routine-task-count'>
                <p><span class='task-count-num'>0</span> <br> <span class='task-count-text'>tasks left</span></p>
            </div>
        `
        document.querySelector('#routines-list').prepend(new_routine)
        new_routine.classList.add('createdItem')
        new_routine.addEventListener('animationend', animateCreate)
    } else if(response.status === 401){
        window.location.href = '/login'
    }
}

const sidebar_new_routine_btn = document.querySelector('#new-routine-sidebar-button').addEventListener('click', createRoutine)
const big_new_routine_btn = document.querySelector('#new-routine-btn').addEventListener('click', createRoutine)



let selectedRoutine= undefined
const initializeRoutine = (routine) =>{
    routine.addEventListener('click', ()=>{
        if(routine === selectedRoutine){
            routine.setAttribute('data-selected', 'false')
            document.querySelector('#blank-routine-content').style.display = 'flex'
            document.querySelector('#instantiated-routine-content').style.display = 'none'
            selectedRoutine = undefined
        }else{
            routine.classList.remove('createdItem')
            routine.removeEventListener('animationend', animateCreate)
            if(selectedRoutine){
                selectedRoutine.setAttribute('data-selected', 'false')
            }
            routine.setAttribute('data-selected', 'true')
            selectedRoutine = routine
            const init_title = routine.dataset.routine_title

            document.querySelector('#blank-routine-content').style.display = 'none'
            document.querySelector('#instantiated-routine-content').style.display = 'block'
            document.querySelector('#title-input').value= init_title
            
        }

    })

}


const routines = document.querySelectorAll('.routine-li')
for(const routine of routines){
    initializeRoutine(routine)
}

