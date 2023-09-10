
console.log(colNames);
colNames.forEach(element => {
    let newRow = document.createElement("th")
    newRow.innerText = element
    document.getElementById("colNames").appendChild(newRow)
});


let table;
function pageLoaded() {
    try { table.destroy() } catch(err) {}

    table = new DataTable('#myTable', { 
        destroy: true,
        dom: ' <"search"f><"top"l>rt<"bottom"ip><"clear">',
        language: {
            searchPlaceholder: "Search",
            search: "",
            paginate: {
                previous: "&laquo;",
                next: "&raquo;"
            }
        },
        pagingType: "full_numbers",
        aaSorting: [[1, "asc"]],
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

}


pageLoaded()