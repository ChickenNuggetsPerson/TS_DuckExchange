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
async function contructTable() {
    let userData = await getUserData()
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
        /*"drawCallback": function( settings ) {
            let api = this.api();
            api.rows( {page:'current'} ).every( function ( rowIdx, tableLoop, rowLoop ) {
                var data = this.node();
                if (document.getElementById(data.getAttribute("bookID")).innerHTML.endsWith("</div>")) {
                    console.log("Loading Image: " + data.getAttribute("imageLink"))
                    let img = new Image();

                    img.onload = function() {
                        document.getElementById(data.getAttribute("bookID")).innerHTML = ""
                        document.getElementById(data.getAttribute("bookID")).appendChild(img)
                    }
                    img.onerror = function() {
                        document.getElementById(data.getAttribute("bookID")).innerHTML = `<svg style="width:60px; margin:20px" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 47.5 47.5" viewBox="0 0 47.5 47.5" id="warning"><defs><clipPath id="a"><path d="M0 38h38V0H0v38Z"></path></clipPath></defs><g clip-path="url(#a)" transform="matrix(1.25 0 0 -1.25 0 47.5)"><path fill="#ffcc4d" d="M0 0c-1.842 0-2.654 1.338-1.806 2.973l15.609 30.055c.848 1.635 2.238 1.635 3.087 0L32.499 2.973C33.349 1.338 32.536 0 30.693 0H0Z" transform="translate(3.653 2)"></path><path fill="#231f20" d="M0 0c0 1.302.961 2.108 2.232 2.108 1.241 0 2.233-.837 2.233-2.108v-11.938c0-1.271-.992-2.108-2.233-2.108-1.271 0-2.232.807-2.232 2.108V0Zm-.187-18.293a2.422 2.422 0 0 0 2.419 2.418 2.422 2.422 0 0 0 2.419-2.418 2.422 2.422 0 0 0-2.419-2.419 2.422 2.422 0 0 0-2.419 2.419" transform="translate(16.769 26.34)"></path></g></svg>`
                    }

                    img.src = data.getAttribute("imageLink")
                    img.style.maxWidth = document.getElementById(data.getAttribute("bookID")).style.maxWidth;
                    img.style.borderRadius = document.getElementById(data.getAttribute("bookID")).style.borderRadius;
                }
                
            } );
        }*/
    });

    if (window.innerWidth > 480) {
        startDucks()
    }

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

    table.draw()
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
async function startDucks() {
    let ref = document.getElementById("duckBackground")
    let outerBorder = document.getElementById("outerBorder").getBoundingClientRect()

    for (let i = 0; i < 7; i++) {
        // object(data="/static/duck.svg" style="width:10%; position:absolute")
        let duck = document.createElement("object")
        duck.data = "/static/duck.svg"
        let width = ((Math.random() * 100) + 40)
        duck.style.width = width + "px"
        duck.style.position = "absolute"

        duck.style.top = (Math.random() * (window.innerHeight - width))

        if ((Math.floor(Math.random() * 100) % 2) == 0) {
            duck.style.left = Math.random() * (outerBorder.left - width)
        } else {
            duck.style.left = (Math.random() * ( window.innerWidth - outerBorder.right - width)) + outerBorder.right
        }

        
        let rotationSpeed = Math.floor((Math.random() * 70) + 10)
        if (Math.floor(Math.random() * 200) % 2 == 0) {
            duck.style.animation = `rotatingCW ${rotationSpeed}s linear infinite`
        } else {
            duck.style.animation = `rotatingCCW ${rotationSpeed}s linear infinite`
        }

        duck.style.zIndex = -100

        ref.appendChild(duck)
    }
}
