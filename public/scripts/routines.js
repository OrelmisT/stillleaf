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
        // uncomment later
        // new_routine.addEventListener('animationend', animateCreate)
    } else if(response.status === 401){
        window.location.href = '/login'
    }
}




// --------------------------------------------------------------------------------------------------------

const bigNewRoutineBtn = document.querySelector('#new-routine-btn')
bigNewRoutineBtn.addEventListener('click', ()=>{
    // alert("hello")
    const instantiatedView = document.querySelector('#instantiated-routine-content')
    const uninstantiatedview = document.querySelector('#blank-routine-content')
    console.log(uninstantiatedview)
    instantiatedView.style.display = 'flex' 
    uninstantiatedview.style.display = 'none'
    createRoutine()

})