

function buildInputs() {
    let container = document.getElementById("catContainer")
    container.setAttribute("data-bs-theme", "dark")

    //div(class="input-group")
    //    span(class="input-group-text") Name:
    //    input(type="text" class="form-control" aria-label="With textarea" id="personName" )  

    categories.forEach(cat => {
        let group = document.createElement("div")
        group.classList.add("input-group")
        group.style.minWidth = "190px"

        let title = document.createElement("span")
        title.classList.add("input-group-text")
        title.innerText = cat.name

        let storedValue = document.createElement("input")
        storedValue.type = "number"
        storedValue.classList.add("form-control")
        storedValue.id = cat.uuid
        storedValue.value = "0"

        
        //div(class="container" style="background-color: rgba(41, 25, 25, 0.27); width: fit-content; padding: 0px; border-radius:10px;")
        let btnDiv = document.createElement('div')
        btnDiv.classList.add("container")
        btnDiv.style.backgroundColor = "rgba(41, 25, 25, 0.27)"
        btnDiv.style.width = "fit-content"
        btnDiv.style.padding = "0px"
        btnDiv.style.borderRadius = "10px"

        let visableBtn = document.createElement("input")
        visableBtn.type = "radio"
        visableBtn.classList.add("btn-check")
        visableBtn.name = cat.uuid + "visableBtn"
        visableBtn.id = cat.uuid + "-success-outlined"
        visableBtn.autocomplete = "off"
        visableBtn.checked = true;

        let visableBtnLabel = document.createElement("label")
        visableBtnLabel.classList.add("btn"); visableBtnLabel.classList.add("btn-outline-success");
        visableBtnLabel.htmlFor = cat.uuid + "-success-outlined"
        visableBtnLabel.innerText = "Visable"


        let not_visableBtn = document.createElement("input")
        not_visableBtn.type = "radio"
        not_visableBtn.classList.add("btn-check")
        not_visableBtn.name = cat.uuid + "visableBtn"
        not_visableBtn.id = cat.uuid + "-danger-outlined"
        not_visableBtn.autocomplete = "off"

        let not_visableBtnLabel = document.createElement("label")
        not_visableBtnLabel.classList.add("btn"); not_visableBtnLabel.classList.add("btn-outline-danger");
        not_visableBtnLabel.htmlFor = cat.uuid + "-danger-outlined"
        not_visableBtnLabel.innerText = "Hidden"

        btnDiv.appendChild(visableBtn)
        btnDiv.appendChild(visableBtnLabel)
        btnDiv.appendChild(not_visableBtn)
        btnDiv.appendChild(not_visableBtnLabel)



        group.appendChild(title)
        group.appendChild(storedValue)
        
        group.appendChild(btnDiv)

        container.appendChild(group)
    });
}
function updateInputs(uuid) {
    if (uuid == "") {
        let items = document.querySelectorAll("input")
        items.forEach(item => {
            item.value = "0"
        })
        return
    }

    let user = getUser(uuid)

    document.getElementById("personName").value = user.name

    user.entries.forEach(entry => {
        document.getElementById(entry.uuid).value = entry.value
        let visableList = document.getElementsByName(entry.uuid + "visableBtn")
        visableList[0].checked = entry.show;
        visableList[1].checked = !entry.show;
        //console.log(entry.show)
    })
}
function buildUserList() {
    users.forEach(user => {
        sideListAddItem(user.name, user.uuid, function() {
            updateInputs(user.uuid)
        })
    })
}


function getCatVals() {
    let arr = []
    categories.forEach(cat => {
        arr.push({
            uuid: cat.uuid,
            value: document.getElementById(cat.uuid).value,
            show: document.getElementsByName(cat.uuid + "visableBtn")[0].checked
        })
    })
    return arr
}


async function saveBtnClicked() {
    await save()
    const parser = new URL(window.location);
    parser.searchParams.set("uuid", selected);
    location.href = parser.href;
    console.log(parser.href)
    setTimeout(() => {
        window.location.replace(parser.href)
    }, 500);
    
}
async function save() {

    let userObj = {
        name: document.getElementById("personName").value,
        uuid: selected,
        entries: getCatVals()
    }

    if (selected != "") {
        return new Promise(async (resolve) => {
            console.log("Saving")
    
            const response = await fetch('/data/admin/editUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userObj)
            });
    
            const rewResult = await response.text();
            console.log(rewResult)
            if (rewResult == "OK") {
                console.log("Saved", "success");
                resolve(true)
            } else {
                console.log("Could Not Save", "error");
                resolve(false)
            }
            
            
        })
    } else {
        return new Promise(async (resolve) => {
            console.log("Saving")
    
            const response = await fetch('/data/admin/addUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userObj)
            });
    
            const rewResult = await response.text();
            console.log(rewResult)
            if (rewResult == "OK") {
                console.log("Saved", "success");
                resolve(true)
            } else {
                console.log("Could Not Save", "error");
                resolve(false)
            }
            
            
        })
    }
    
}
async function deleteUsr() {

    console.log("Deleting", selected)

    if (!(await userConfirm("Are you sure you want to delete this user?"))) { return; }

    const response = await fetch('/data/admin/deleteUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            uuid: selected
        })
    });

    const rewResult = await response.text();
    console.log(rewResult)
    if (rewResult == "OK") {
        console.log("Deleted", "success");

    } else {
        console.log("Could Not Delete", "error");

    }
    
    setTimeout(() => {
        location.reload();
    }, 500);
}




function buildPage() {

    sideListAddItem("New User", "", function() {
        updateInputs("")
    })

    buildInputs();
    buildUserList();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('uuid')) {
        sidelistSelectUUID(urlParams.get("uuid"))
    } else {
        sidelistSelectIndex(1)
    }
}
buildPage()
