
console.log(categories)
console.log(users)



function getCategory(uuid) {
    for (let i = 0; i < categories.length; i++) {
        if (categories[i].uuid == uuid) {
            return categories[i]
        }
    }
    return undefined
}
function getUser(uuid) {
    for (let i = 0; i < users.length; i++) {
        if (users[i].uuid == uuid) {
            return users[i]
        }
    }
    return undefined
}


let listLength = 0
let selected = ""
function sideListAddItem(name, uuid, clickFunction) {
    
    let li = document.createElement("li")
    li.innerText = name
    li.classList.add("list-group-item")
    if (listLength == 0) {
        li.classList.add("active")
    }
    
    let numer = listLength
    li.onclick = function () {
        for (let i = 0; i < document.getElementById("sideList").children.length; i++) {
            document.getElementById("sideList").children.item(i).classList.remove("active")
        }
        document.getElementById("sideList").children.item(numer).classList.add("active")
        
        selected = uuid
        clickFunction()
    }
    listLength ++;
    document.getElementById("sideList").appendChild(li)
}