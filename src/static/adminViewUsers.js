

function buildInputs() {
    let container = document.getElementById("catContainer")

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

        group.appendChild(title)
        group.appendChild(storedValue)
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
            value: document.getElementById(cat.uuid).value
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
    }
}
buildPage()
