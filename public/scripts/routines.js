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



let editLiTitle = undefined
let editRoutineTitle = undefined
let delete_routine = undefined

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

            document.querySelector('#title-input').removeEventListener('input', editLiTitle)
            editLiTitle = (e) => {
                routine.dataset.routine_title = e.target.value
                if(e.target.value === ''){
                    routine.querySelector('.routine-li-title').textContent = 'Untitled'
                }else{
                    routine.querySelector('.routine-li-title').textContent = e.target.value
                }
            }
            document.querySelector('#title-input').addEventListener('input', editLiTitle)

            document.querySelector('#title-input').removeEventListener('blur', editRoutineTitle)
            editRoutineTitle = async (e) =>{
                const title = e.target.value
                const response = await fetch(`/routines/${routine.dataset.routine_id}`, {method:"PUT", headers:{"Content-Type": 'application/json'},body:JSON.stringify({title:title})})
                if(response.status === 401){
                    window.location.href = "/login"
                }
                else if(response.status === 200){
                    const response_body = await response.json()
                    if(response_body.message === 'routine successfully updated'){
                        const routines_list = document.querySelector('#routines-list')
                        routine.remove()
                        routines_list.prepend(routine)
                    }
                }   
            }
            document.querySelector('#title-input').addEventListener('blur', editRoutineTitle)


            // Setup delete reflection handler (persist)
            document.querySelector('#delete').removeEventListener('click', delete_routine)
            delete_routine = async (e) =>{

                const response = await fetch(`/routines/${routine.dataset.routine_id}`, {method:'DELETE'})
                if(response.status === 200){
                    

                    routine.classList.add('deletedItem')
                    routine.addEventListener('animationend', ()=>{
                        const nextRoutine = routine.nextElementSibling
                        const prevRoutine = routine.previousElementSibling
                        if(nextRoutine){
                            nextRoutine.click()
                        }else if (prevRoutine){
                            prevRoutine.click()
                        }else{
                            document.querySelector('#blank-routine-content').style.display = 'flex'
                            document.querySelector('#instantiated-routine-content').style.display = 'none'
                        }
                        routine.remove()
                    })
                } else if(response.status === 401){
                    window.location.href = "/login"
                }

            }
            document.querySelector('#delete').addEventListener('click', delete_routine)
            
        
        
        }

    })

}


const routines = document.querySelectorAll('.routine-li')
for(const routine of routines){
    initializeRoutine(routine)
}




// traverse through the reflections using arrow keys
document.addEventListener('keyup', (e) => {

    e.preventDefault()

    if(document.activeElement === document.querySelector('#title-input')){
        if(e.key === 'Enter'){
            document.activeElement.blur()
        }
       return
    }


    if(!selectedRoutine){
        return
    }

    if ((e.key === 'ArrowUp' || e.key == 'ArrowLeft') && selectedRoutine.previousElementSibling) {
        selectedRoutine.previousElementSibling.click()

    } else if ((e.key === 'ArrowDown' || e.key === 'ArrowRight') && selectedRoutine.nextElementSibling){
        selectedRoutine.nextElementSibling.click()
    } else if (e.key === 'Backspace'){
         if(document.activeElement === document.querySelector('#search-bar')){
            return 
         } 

       document.querySelector('#delete').click()
    }
        
});