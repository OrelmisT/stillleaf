logout_btn = document.querySelector('#logout')
logout_btn.addEventListener("click", (e) => {
    localStorage.clear()
    window.location.href = '/logout'
})

const username = document.querySelector('#username').textContent
const email = document.querySelector('#email').textContent
// localStorage.setItem('username', username)
// localStorage.setItem('email', email)



// Util func
const getSQLTimestamp = () => {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');

  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1); // Months are 0-indexed
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


function formatToEST(timestamp) {
  const date = new Date(timestamp);

  const options = {
    timeZone: 'America/New_York',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  };

  const readable_ts = date.toLocaleString('en-US', options)
  console.log(readable_ts)

  return readable_ts
}


const animateCreate = (e) =>{
    initializeReflection(e.target)
    e.target.click()
    document.querySelector('#title-input').focus()

}


// create a new note

const createPost = async ()=>{
    // document.querySelector('#blank-note-content').style.display = 'none'
    // document.querySelector('#instantiated-note-content').style.display = 'block'

    // remove filtering on reflection list items
    document.querySelector('#search-bar').value = ''
    document.querySelectorAll('.reflection-li').forEach((reflectionli) => reflectionli.style.display='flex')

    const ts = getSQLTimestamp()
    const readable_ts = formatToEST(ts)
    const response = await fetch('/reflections', {method:'POST', headers:{"Content-Type": 'application/json'}, body: JSON.stringify({title:'', content:'',timestamp:ts})})
    if (response.status === 201){

        const data = await response.json()
        const new_reflection = document.createElement('div')
        new_reflection.classList.add('reflection-li')
        new_reflection.setAttribute('data-selected', 'false')
        new_reflection.setAttribute('data-post_id', data.reflection.id)
        new_reflection.setAttribute('data-reflection_title', data.reflection.title)
        let numDay = readable_ts.slice(4,6)
        numDay = numDay.split(',').join('')
        if(numDay.length === 1){
            numDay = '0' + numDay
        }
        new_reflection.innerHTML = `
            <div class='reflection-li-content'>
                <p  class="reflection-li-title" style="font-weight: bold; font-size: 1.2rem;">${data.reflection.title || 'Untitled'}</p>
                <p class="reflection-li-body" style="font-size: 0.8rem;">${data.reflection.content}</p>
                <p class="reflection-li-last-modified_ts" style="font-size: 0.6rem;" > Last modified ${readable_ts}</p>
            </div>
            <div class="reflection-li-creation-ts">
                            <p>${readable_ts.slice(0, 3)} <br> ${numDay}</p>
            </div>
        `
        document.querySelector('#notes-list').prepend(new_reflection)
        new_reflection.classList.add('createdItem')
        new_reflection.addEventListener('animationend', animateCreate)
    } else if (response.status === 401){
        window.location.href = '/login'
    }
}
const sidebar_new_reflection_btn = document.querySelector('#new-note-sidebar-button').addEventListener('click', createPost)
const big_new_reflection_btn = document.querySelector('#new-leaf-btn').addEventListener('click', createPost)

// Switch focus to reflection body input when clicking enter on title
const body_input = document.querySelector('#body-input')
document.querySelector('#title-input').addEventListener('keyup', (e) =>{
    if(e.key === 'Enter'){
        e.preventDefault()
        e.stopPropagation()
        body_input.focus()
        document.querySelector('#body-input').trimStart()
    }
})


// event handlers
let editLiTitle = undefined
let editLiBody = undefined
let editPost = undefined
let deletePost = undefined

const initializeReflection = (reflection) =>{
    reflection.addEventListener("click", ()=>{
        if(reflection === selectedReflection){ 
            // deselect if is current selected reflection
           reflection.setAttribute('data-selected', 'false')
           document.querySelector('#blank-note-content').style.display = 'flex'
           document.querySelector('#instantiated-note-content').style.display = 'none'
           selectedReflection = undefined
        }
        else{

            reflection.classList.remove('createdItem')
            reflection.removeEventListener('animationend', animateCreate)

            // select if it is not current reflection

            if(selectedReflection){
                //deselect the currently selected reflection if there is one
                selectedReflection.setAttribute('data-selected', 'false')
            }
            reflection.setAttribute('data-selected', 'true')
            selectedReflection = reflection
            const init_title = reflection.dataset.reflection_title
            const init_content = reflection.querySelector('.reflection-li-body').textContent


            document.querySelector('#blank-note-content').style.display = 'none'
            document.querySelector('#instantiated-note-content').style.display = 'block'
            document.querySelector('#title-input').value= init_title
            document.querySelector('#body-input').value = init_content  

            // Set up handler to edit sidebar list item title
            document.querySelector('#title-input').removeEventListener('input', editLiTitle)
            editLiTitle = (e) =>{
                reflection.dataset.reflection_title = e.target.value
                if(e.target.value === ''){
                    reflection.querySelector('.reflection-li-title').textContent = 'Untitled'
                }else{
                    reflection.querySelector('.reflection-li-title').textContent = e.target.value
                }
            }
            document.querySelector('#title-input').addEventListener('input', editLiTitle)

            // Set up handler to edit sidebar list item content
            document.querySelector('#body-input').removeEventListener('input', editLiBody)
            editLiBody = (e)=>{
                reflection.querySelector('.reflection-li-body').textContent = e.target.value
            }
            document.querySelector('#body-input').addEventListener('input', editLiBody)


            // Set up edit reflection handler (persist)
            document.querySelector('#title-input').removeEventListener('blur', editPost)
            document.querySelector('#body-input').removeEventListener('blur', editPost)
            editPost = async (e) =>{
                const title = reflection.dataset.reflection_title
                console.log(`relfection title: ${title}`)
                const content = reflection.querySelector('.reflection-li-body').textContent
                const ts = getSQLTimestamp()
                const response = await fetch(`/reflections/${reflection.dataset.post_id}`, {method:"PUT", headers:{"Content-Type": 'application/json'},body:JSON.stringify({title:title, content:content,last_modified_time_stamp:ts})})
                if(response.status === 401){
                    window.location.href = "/login"
                }
                if(response.status === 200 ){
                    const response_body = await response.json()
                    if(response_body.message === 'reflection successfully updated'){
                        // update last_modified_ts on side panel
                        reflection.querySelector('.reflection-li-last-modified_ts').textContent = `Last modified ${formatToEST(ts)}`
                        const notes_list = document.querySelector('#notes-list')
                        // Move to the top of the list
                        reflection.remove()
                        notes_list.prepend(reflection)

                    }

                }
            }
            document.querySelector('#body-input').addEventListener('blur', editPost)
            document.querySelector('#title-input').addEventListener('blur', editPost)
            

            // Setup delete reflection handler (persist)
            document.querySelector('#delete').removeEventListener('click', deletePost)
            deletePost = async (e) =>{

                const response = await fetch(`/reflections/${reflection.dataset.post_id}`, {method:'DELETE'})
                if(response.status === 200){
                    

                    reflection.classList.add('deletedItem')
                    reflection.addEventListener('animationend', ()=>{
                        const nextReflection = reflection.nextElementSibling
                        const prevReflection = reflection.previousElementSibling
                        if(nextReflection){
                            nextReflection.click()
                        }else if (prevReflection){
                            prevReflection.click()
                        }else{
                            document.querySelector('#blank-note-content').style.display = 'flex'
                            document.querySelector('#instantiated-note-content').style.display = 'none'
                        }
                        reflection.remove()
                    })
                } else if(response.status === 401){
                    window.location.href = "/login"
                }

            }
            document.querySelector('#delete').addEventListener('click', deletePost)

        }
        
        
    })

}

// Selecting and deselecting reflections
let selectedReflection = undefined
const reflections = document.querySelectorAll('.reflection-li')
for(const reflection of reflections){
    initializeReflection(reflection)
}


// traverse through the reflections using arrow keys
document.addEventListener('keyup', (e) => {

    e.preventDefault()

    if(document.activeElement === document.querySelector('#title-input')){
       return
    }

    if(document.activeElement === document.querySelector("#body-input")){
        if(e.ctrlKey && e.key === 'Enter'){
            document.activeElement.blur()
        }else{
            return
        }
    }

    if(!selectedReflection){
        return
    }

    if ((e.key === 'ArrowUp' || e.key == 'ArrowLeft') && selectedReflection.previousElementSibling) {
        selectedReflection.previousElementSibling.click()

    } else if ((e.key === 'ArrowDown' || e.key === 'ArrowRight') && selectedReflection.nextElementSibling){
        selectedReflection.nextElementSibling.click()
    } else if (e.key === 'Backspace'){
         if(document.activeElement === document.querySelector('#search-bar')){
            return 
         } 

       document.querySelector('#delete').click()
    }
        
});



// Filter using search bar
document.querySelector("#search-bar").addEventListener("input", (e) =>{
    console.log(e.target.value)
   const searchTerm = e.target.value.toLowerCase()
   const relfectionLis = document.querySelectorAll(".reflection-li")
   relfectionLis.forEach((reflectionLi) => {
        const title = reflectionLi.querySelector('.reflection-li-title')
        const body = reflectionLi.querySelector('.reflection-li-body')
        if(title.textContent.toLowerCase().includes(searchTerm) ||body.textContent.toLowerCase().includes(searchTerm) ){
            reflectionLi.style.display = 'flex'
        }else{
            reflectionLi.style.display = 'none'
        }
   })
})