console.log(colNames);
colNames.forEach(element => {
    let newRow = document.createElement("th")
    newRow.innerText = element.name
    newRow.style.color = "white"
    document.getElementById("colNames").appendChild(newRow)
});



async function getUserData() {
    let data;
    await fetch('/data/users', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    })
    .then(response => response.json())
    .then(response => {
        if (response.error) {
            throw new Error("Error Getting User Data");
        } else {
        data = response
        }
    })
    return data
}

function getValFromUUID(uuid, entryArray) {
    let value = 0;
    entryArray.forEach(entry => {
        if (entry.uuid == uuid) {
            value = entry.value
        }
    });
    return value;
}
function getVisFromUUID(uuid, entryArray) {
    let value = true;
    entryArray.forEach(entry => {
        if (entry.uuid == uuid) {
            value = entry.show
        }
    });
    return value;
}


let userData;
async function contructTable() {
    userData = await getUserData()
    console.log(userData)

    let tbody = document.getElementById("list")
    userData.forEach(user => {
        let row = document.createElement("tr")

        let name = document.createElement("th")
        name.innerText = user.name
        row.appendChild(name)

        colNames.forEach(col => {
            let item = document.createElement("th")
            item.innerText = getValFromUUID(col.uuid, user.entries)
            item.id = col.uuid + "-" + user.uuid
            row.appendChild(item)
        });

        row.setAttribute("uuid", user.uuid)

        tbody.appendChild(row)
    });
}



let table;
async function pageLoaded() {
    try { table.destroy() } catch(err) {}

    try {
        await contructTable()
    } catch (err) { console.log(err) }

    table = new DataTable('#myTable', { 
        destroy: true,
        dom: ' <"search"f><"top"l>rt<"bottom"ip><"clear">',
        //"scrollX": true,
        language: {
            searchPlaceholder: "Search",
            search: "",
            paginate: {
                previous: "&laquo;",
                next: "&raquo;"
            }
        },
        pagingType: "full_numbers",
        aaSorting: [[1, "desc"]],
        "drawCallback": function( settings ) {
            console.log("Rerendering")
            let api = this.api();
            api.rows( {page:'current'} ).every( function ( rowIdx, tableLoop, rowLoop ) {
                var data = this.node();
                let uuid = data.getAttribute("uuid")
                let user = getUser(uuid, userData)
                colNames.forEach(col => {
                    if (!getVisFromUUID(col.uuid, user.entries))
                        document.getElementById(col.uuid + "-" + uuid).innerText = "*"
                })
                
            } );
        }
    });


    startDucks()


    let refreshTime = 5;
    setInterval(() => {
        refreshPageData();
    }, refreshTime * 1000);

}



function getUser(uuid, newData) {
    for (let i = 0; i < newData.length; i++) {
        if (newData[i].uuid == uuid) {
            return newData[i]
        }
    }
    return undefined
}
async function refreshPageData() {
    console.log("Refreshing")
    
    let newData = await getUserData();
    userData = newData

    table.rows().every( function ( rowIdx, tableLoop, rowLoop ) {
        var data = this.node();
        let userUUID = data.getAttribute("uuid")

        let userObj = getUser(userUUID, newData)
        userObj.entries.forEach(entry => {
            try {
                document.getElementById(entry.uuid + "-" + userObj.uuid).innerText = entry.value
            } catch (err) {}
        })
    });

    //table.draw()
    table.rows().invalidate().draw();
}


function boundsWithin(bound1, bound2) {
    if (bound1.right > bound2.left || bound1.left < bound2.right) {
        if (bound1.bottom > bound2.top || bound1.top < bound2.bottom) {
            return true
        }
    }
    return false;
}

let duckArray = []
let ripple;

async function startDucks() {
    let ref = document.getElementById("duckBackground")
    

    let computerDucks = 10;
    let mobileDucks = 2;
    for (let i = 0; i < ((window.innerWidth > 500) ? computerDucks : mobileDucks); i++) {
        // object(data="/static/duck.svg" style="width:10%; position:absolute")

        duckArray.push(new Duck(ref))
    }

    if (localStorage.getItem("physicsEnabled")) {
        physicsEnabled = JSON.parse(localStorage.getItem("physicsEnabled"))
        physicsSwitch.checked = physicsEnabled;
    } else {
        physicsEnabled = true;
    }

    setInterval(updateDucks, 20)
    setInterval(updateRipple, 10)
}




function getPositionAtCenter(element) {
    const {top, left, width, height} = element.getBoundingClientRect();
    return {
      x: left + width / 2,
      y: top + height / 2
    };
}

function getDistanceBetweenElements(a, b) {
   const aPosition = getPositionAtCenter(a);
   const bPosition = getPositionAtCenter(b);
 
   return Math.hypot(aPosition.x - bPosition.x, aPosition.y - bPosition.y);  
}



let physicsEnabled = true;
let physicsSwitch = document.getElementById("physicsSwitch")

// Ripple System
let mouseOver = false;
document.getElementById("outerBorder").onmouseover = function(event) {
    mouseOver = true;
};
document.getElementById("outerBorder").onmouseout = function(event) {
    mouseOver = false;
}
document.getElementById("duckPhysicsSwitchDiv").onmouseover = function(event) {
    mouseOver = true;
};
document.getElementById("duckPhysicsSwitchDiv").onmouseout = function(event) {
    mouseOver = false;
}

// Create Ripple
document.body.addEventListener('click', event => {
    //console.log(event.clientX,  event.clientY)
    if (mouseOver) { return; }
    if (!physicsEnabled) { return; }
    try {
        ripple.delete()
    } catch(err) {}
    
    ripple = new DuckRipple(event.clientX,  event.clientY)
}, true);
function updateRipple() {
    try {
        ripple.iterate();
    } catch(err) {}
}

function updateDucks() {
    if (physicsSwitch.checked != physicsEnabled) {
        physicsEnabled = physicsSwitch.checked
        localStorage.setItem("physicsEnabled", JSON.stringify(physicsEnabled))
    } 

    if (!physicsEnabled) { return; }

    for (let i = 0; i < duckArray.length; i++) {
        duckArray[i].update()
        duckArray[i].checkRippple()

        //continue;
        // Check Bounces off Other Ducks
        for (let x = 0; x < duckArray.length; x++) {
            for (let y = 0; y < duckArray.length; y++) {
                if (x == y) { continue; }
                //if (getDistanceBetweenElements(duckArray[x].duck, duckArray[y].duck) < 100)
                    duckArray[x].checkDuckBounce(duckArray[y])
            }
        }
    }
}



let userToSend = ""
function highlightUser(uuid) {

    console.log(uuid)
    userToSend = uuid

    document.getElementById("userSelectDisplay").value = userData.find(user => user.uuid === uuid).name
    
}

async function submitCTF() {

    let form = document.createElement("div")
    form.innerHTML = `
        
        <div class="input-group mb-3">
            <div class="btn-group">
                <button type="button" class="btn btn-primary dropdown-toggle dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"> Choose Your name </button>

                <ul class="dropdown-menu" id="userDropdown">
                
                </ul>

                <input class="form-control" name="" aria-describedby="basic-addon3" disabled id="userSelectDisplay">
            </div>
        </div>

        <br>

        <div class="input-group mb-3">
            <div class="input-group-prepend">
                <span class="input-group-text" id="basic-addon3"> CTF </span>
            </div>
            <input class="form-control" name="ctf" aria-describedby="basic-addon3" id="sendCTF">
        </div>`;


    let dropDown = form.querySelector("#userDropdown")
    console.log(dropDown)
    userData.forEach(user => {
        let li = document.createElement("li")
        let a = document.createElement("a")
        a.classList.add("dropdown-item")
        a.innerText = user.name
        a.onclick = () => {
            highlightUser(user.uuid)
        }

        li.appendChild(a)
        dropDown.appendChild(li)
    })

    bootbox.alert({
        title: "Submit CTF",
        message: form,
        backdrop: true,
        centerVertical: true,
        callback: async function() {
            if (userToSend === "") { return }
    
            let dialog = bootbox.dialog({
                title: 'Submiting',
                centerVertical: true,
                message: '<p><i class="fas fa-spin fa-spinner"></i>Loading...</p>'
            });
    
    
            let ctf = document.getElementById("sendCTF").value
            let sendResult = await sendCTF(ctf, userToSend)
            userToSend = ""
    
            if (sendResult) {
                dialog.find('.bootbox-body').html('Correct!');
            } else {
                dialog.find('.bootbox-body').html('Invalid CTF');
            }
    
            setTimeout(() => {
                dialog.modal('hide');
            }, 2500);
            
        }
    });
}
async function sendCTF(ctf, user) {
    return new Promise(async (resolve) => {
        console.log("Saving")

        const response = await fetch('/data/users/submitCTF', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userUUID: user,
                ctf: ctf
            })
        });

        const rewResult = await response.text();
        console.log(rewResult)
        if (rewResult == "OK") {
            resolve(true)
        } else {
            resolve(false)
        }
    })
}