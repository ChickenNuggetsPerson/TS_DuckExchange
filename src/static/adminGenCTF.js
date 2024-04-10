
console.log(ctfs)

let generatedContainer = document.getElementById("ctfContainer")
let manualContainer = document.getElementById("manualCTFContainer")

function fillContainer(ctfs, container, isManual) {
    container.innerHTML = ""

    let form = document.createElement("form")
    ctfs.forEach(ctf => {

         // div(class="input-group mb-3" data-bs-theme="dark")
        //     div(class="input-group-prepend")
        //         span(class="input-group-text" id="basic-addon3") SHS_CTF{
        //     input(class="form-control" name="ctf" aria-describedby="basic-addon3" id="ctfInput")


        let div = document.createElement("div")
        div.classList.add("input-group", "mb-3")
        div.setAttribute("data-bs-theme", "dark")

        div.addEventListener("click", () => {
            copyText(ctf.ctf)
        })

        // Create CTF displayer
        let ctfInput = document.createElement("input")
        ctfInput.classList.add("form-control")
        ctfInput.disabled = true
        ctfInput.value = ctf.ctf

        // Create Value displayer
        let valueShowerDiv = document.createElement("div")
        valueShowerDiv.classList.add("input-group-prepend")

        let valueShower = document.createElement("span")
        valueShower.classList.add("form-control")
        valueShower.innerText = ctf.value

        valueShowerDiv.appendChild(valueShower)


        let xButtonDiv = document.createElement("div")
        if (isManual) {
            xButtonDiv.classList.add("input-group-prepend")

            let xButton = document.createElement("button")
            xButton.classList.add("form-control", "btn", "btn-danger")
            xButton.innerHTML = `X`
            xButton.onclick = () => {
                deleteCTF(ctf.ctf)
            }

            xButtonDiv.appendChild(xButton)
        }
        


        div.appendChild(ctfInput)
        div.appendChild(valueShowerDiv)
        div.appendChild(xButtonDiv)
        container.appendChild(div)

    });
    container.appendChild(form)
}   
async function submitCTF() {
    let ctfInput = document.getElementById("ctfInput")
    if (ctfInput.value == "") { return;}

    let ctfValueInput = document.getElementById("ctfValue")

    let ctf = `SHS_CTF{${ctfInput.value}}`
    let value = ctfValueInput.value

    console.log(ctf, value)


    const response = await fetch('/data/admin/ctf/edit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: "add", // delete
            ctf: ctf,
            value: value
        })
    });

    const rewResult = await response.text();
    console.log(rewResult)
    if (rewResult == "OK") {
        console.log("Submitted", "success");

    } else {
        console.log("Error", "error");

    }
    
    setTimeout(() => {
        location.reload();
    }, 500);
}
async function deleteCTF(ctf) {
    const response = await fetch('/data/admin/ctf/edit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: "delete",
            ctf: ctf,
            value: 0
        })
    });

    const rewResult = await response.text();
    console.log(rewResult)
    if (rewResult == "OK") {
        console.log("Submitted", "success");

    } else {
        console.log("Error", "error");

    }
    
    setTimeout(() => {
        location.reload();
    }, 500);
}

async function copyText(text) {
    console.log("Copying: ", text)
    
    try {
        await navigator.clipboard.writeText(text)
        $.notify("CTF Coppied", "success");
    } catch(err) {
        $.notify("There was an error copying the CTF", "error");
    }
    
}



fillContainer(ctfs, generatedContainer, false)
fillContainer(manualCTFs, manualContainer, true)