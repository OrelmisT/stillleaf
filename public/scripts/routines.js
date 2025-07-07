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