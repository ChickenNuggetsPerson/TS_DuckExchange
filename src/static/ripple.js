


class DuckRipple {

    xPos = 0;
    yPos = 0;

    maxWidth = 700;
    width = 0;

    ripple;
    alive = false;

    color = "213, 225, 245"

    constructor(xPos, yPos) {
        this.xPos = xPos;
        this.yPos = yPos;

        this.ripple = document.createElement("div");
        
        this.ripple.style.position = "absolute"
        this.ripple.style.borderRadius = "50%"

        this.ripple.style.borderWidth = "2px"
        this.ripple.style.borderStyle = "solid"
        this.ripple.style.boxShadow = "2px 2px 10px #111111"

        this.ripple.style.width = "0px"
        this.ripple.style.height = "0px"
        this.ripple.style.left = this.xPos - (this.width / 2)
        this.ripple.style.top =  this.yPos - (this.width / 2)

        this.ripple.style.zIndex = 200;
        this.ripple.id = "ripple"

        document.getElementById("rippleBackground").appendChild(this.ripple)
        this.alive = true;
    }
    delete() {
        this.ripple.remove();
        this.alive = false;
    }

    iterate() {
        if (!this.alive) { return; }

        this.width += 4
        this.ripple.style.width = this.width + "px"
        this.ripple.style.height = this.width + "px"
        this.ripple.style.left = this.xPos - (this.width / 2)
        this.ripple.style.top =  this.yPos - (this.width / 2)

        let transparency = 1 - (this.width / this.maxWidth)
        this.ripple.style.borderColor = `rgba(${this.color}, ${transparency})`
        let maxborderSize = 1000;
        let amount = (maxborderSize / 2) - ((this.width / this.maxWidth) * maxborderSize)

        this.ripple.style.boxShadow = `0px 0px 10px rgba(${this.color}, ${transparency / 4})`

        if (this.width > this.maxWidth) {
            this.delete();
        }
    }
};