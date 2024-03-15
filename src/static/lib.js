function changePage(url) {
    window.location.replace(url);
}

window.addEventListener('resize', adjustDivSize);
function adjustDivSize() {
    const outer = document.getElementById('outerBorder');
    const inner = document.getElementById("innerBoarder")
    const leaderText = document.getElementById("leaderboardText")

    if (window.innerWidth < 650) {
        outer.style.width = '100%';
        outer.style.borderRadius = "0px"

        outer.style.paddingLeft = "0px"
        outer.style.paddingRight = "0px"
        outer.style.marginBottom = "100px"

        inner.style.borderRadius = "0px"

        leaderText.style.fontSize = "12vw"

    } else {
        outer.style.width = '75vw';
        outer.style.borderRadius = "60px"

        outer.style.paddingLeft = "30px"
        outer.style.paddingRight = "30px"
        outer.style.marginBottom = ""

        inner.style.borderRadius = "45px"

        leaderText.style.fontSize = "7vw"

    }
}

