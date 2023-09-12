


function buildInputs() {
    let container = document.getElementById("catContainer")

    //div(class="input-group")
    //    span(class="input-group-text") Name:
    //    input(type="text" class="form-control" aria-label="With textarea" id="personName" )  

}
function updateInputs(uuid) {
    if (uuid == "") {
        let items = document.querySelectorAll("input")
        items.forEach(item => {
            item.value = ""
        })
        let visableList = document.getElementsByName('visable')
        visableList[0].checked = false;
        visableList[1].checked = false;
        return
    }

    let cat = getCategory(uuid)

    document.getElementById("personName").value = cat.name
    let visableList = document.getElementsByName('visable')
    visableList[0].checked = cat.isVisable;
    visableList[1].checked = !cat.isVisable;

}
function buildUserList() {
    categories.forEach(cat => {
        sideListAddItem(cat.name, cat.uuid, function() {
            updateInputs(cat.uuid)
        })
    })
}



function getVisable() {
    var ele = document.getElementsByName('visable');
    return ele[0].checked
}

async function saveBtnClicked() {
    await save()
    setTimeout(() => {
        location.reload();
    }, 1000);
    
}
async function save() {

    let userObj = {
        name: document.getElementById("personName").value,
        uuid: selected,
        isVisable: getVisable()
    }

    if (selected != "") {
        return new Promise(async (resolve) => {
            console.log("Saving")
    
            const response = await fetch('/data/admin/editCategory', {
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
    
            const response = await fetch('/data/admin/createCategory', {
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

    const response = await fetch('/data/admin/deleteCategory', {
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
    }, 1000);
}




function buildPage() {

    sideListAddItem("New Category", "", function() {
        updateInputs("")
    })

    buildInputs();
    buildUserList();
}
buildPage()
