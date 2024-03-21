

console.log(ctfs)


let container = document.getElementById("ctfContainer")
let form = document.createElement("form")

ctfs.forEach(ctf => {
    let div = document.createElement("div")
    div.classList.add("mb-3")
    div.setAttribute("data-bs-theme", "dark")

    let input = document.createElement("input")
    input.classList.add("form-control")
    input.disabled = true
    input.value = ctf
    input.setAttribute("data-bs-theme", "dark")

    div.appendChild(input)
    form.appendChild(div)
});

container.appendChild(form)