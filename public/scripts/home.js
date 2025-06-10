new_leaf_btn = document.querySelector('#new-leaf-btn')
new_leaf_btn.addEventListener("click", (e) => {
    console.log(window.location.href)
    window.location.href = "/login"
})

logout_btn = document.querySelector('#person')
logout_btn.addEventListener("click", (e) => {
    window.location.href = '/logout'
})