new_leaf_btn = document.querySelector('#new-leaf-btn')
new_leaf_btn.addEventListener("click", (e) => {
    console.log(window.location.href)
    window.location.href = "http://localhost:8500/login"
})