logout_btn = document.querySelector('#logout')
logout_btn.addEventListener("click", (e) => {
    window.location.href = '/logout'
})



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


// create a new note

const createPost = async ()=>{
    // document.querySelector('#blank-note-content').style.display = 'none'
    // document.querySelector('#instantiated-note-content').style.display = 'block'
    const ts = getSQLTimestamp()
    const response = await fetch('/reflections', {method:'POST', headers:{"Content-Type": 'application/json'}, body: JSON.stringify({title:'', content:'',timestamp:ts})})
    if (response.status === 201){

        const data = await response.json()
        const new_reflection = document.createElement('div')
        new_reflection.classList.add('reflection-li')
        new_reflection.setAttribute('data-selected', 'false')
        new_reflection.setAttribute('data-post_id', data.reflection.id)
        new_reflection.setAttribute('data-reflection_title', data.reflection.title)
        new_reflection.innerHTML = `
            <div class='reflection-li-content'>
                <p  class="reflection-li-title" style="font-weight: bold; font-size: 1.2rem;">${data.reflection.title || 'Untitled'}</p>
                <p class="reflection-li-body" style="font-size: 0.8rem;"> ${data.reflection.content}</p>
                <p style="font-size: 0.6rem;" > Last modified ${data.reflection.last_modified_time_stamp}</p>
            </div>
            <div class="reflection-li-creation-ts">
                            <p>JAN <br> 24</p>
            </div>
        `
        document.querySelector('#notes-list').prepend(new_reflection)
        initializeReflection(new_reflection)
        new_reflection.click()
    }
}
const sidebar_new_reflection_btn = document.querySelector('#new-note-sidebar-button').addEventListener('click', createPost)
const big_new_reflection_btn = document.querySelector('#new-leaf-btn').addEventListener('click', createPost)

// Switch focus to reflection body input when clicking enter on title
const body_input = document.querySelector('#body-input')
document.querySelector('#title-input').addEventListener('keyup', (e) =>{
    if(e.key === 'Enter'){
        e.preventDefault()
        body_input.focus()
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
                const content = reflection.querySelector('.reflection-li-body').textContent
                const response = await fetch(`/reflections/${reflection.dataset.post_id}`, {method:"PUT", headers:{"Content-Type": 'application/json'},body:JSON.stringify({title:title, content:content,last_modified_time_stamp:getSQLTimestamp()})})
            }
            document.querySelector('#title-input').addEventListener('blur', editPost)
            document.querySelector('#body-input').addEventListener('blur', editPost)
            

            // Setup delete reflection handler (persist)
            document.querySelector('#delete').removeEventListener('click', deletePost)
            deletePost = async (e) =>{

                const response = await fetch(`/reflections/${reflection.dataset.post_id}`, {method:'DELETE'})
                if(response.status === 200){
                    document.querySelector('#blank-note-content').style.display = 'flex'
                    document.querySelector('#instantiated-note-content').style.display = 'none'
                    reflection.remove()
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