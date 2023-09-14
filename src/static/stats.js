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
async function startDucks() {
    let ref = document.getElementById("duckBackground")
    

    let computerDucks = 10;
    let mobileDucks = 2;
    for (let i = 0; i < ((window.innerWidth > 480) ? computerDucks : mobileDucks); i++) {
        // object(data="/static/duck.svg" style="width:10%; position:absolute")

        duckArray.push(new Duck(ref))
    }

    setInterval(updateDucks, 20)
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

function updateDucks() {
    for (let i = 0; i < duckArray.length; i++) {
        duckArray[i].update()

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