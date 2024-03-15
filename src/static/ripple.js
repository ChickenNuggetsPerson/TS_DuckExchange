


class DuckRipple {

    xPos = 0;
    yPos = 0;

    maxWidth = 700;
    width = 0;

    ripple;
    alive = false;

    babyRipples = []
    amtOfBabyRipples = 2;

    rippleTime = 5;
    startTime;
    endTime;

    color = "213, 225, 245"

    constructor(xPos, yPos) {
        this.xPos = xPos;
        this.yPos = yPos;

        this.ripple = this.createRippleObj(-200);
        this.ripple.id = "ripple"
        document.getElementById("rippleBackground").appendChild(this.ripple)
        this.alive = true;

        for (let i = 0; i < this.amtOfBabyRipples; i++) {
            this.babyRipples.push(this.createRippleObj(-201));
            document.getElementById("rippleBackground").appendChild(this.babyRipples[i])
        }

        this.startTime = Date.now();
        this.endTime = this.startTime + (this.rippleTime * 1000)
    }
    createRippleObj(zIndex) {
        let d = document.createElement("div");
        d.style.position = "fixed"
        d.style.borderRadius = "50%"

        d.style.borderWidth = "2px"
        d.style.borderStyle = "solid"
        d.style.boxShadow = "2px 2px 10px #111111"

        d.style.width = "0px"
        d.style.height = "0px"
        d.style.left = this.xPos - (this.width / 2)
        d.style.top =  this.yPos - (this.width / 2)

        d.style.zIndex = zIndex;
        return d;
    }
    delete() {
        this.ripple.remove();
        for (let i = 0; i< this.babyRipples.length; i++) {
            this.babyRipples[i].remove();
        }
        this.alive = false;
    }

    iterate() {
        if (!this.alive) { return; }

        let percent = (Date.now() - this.startTime) / (this.endTime - this.startTime)
        this.width = this.maxWidth * percent;

        this.iterateRipple(this.ripple, this.width)

        for (let i = 0; i < this.babyRipples.length; i++) {
            this.iterateRipple(this.babyRipples[i], this.width - ( i * 20 ));
        }

        if (this.width > this.maxWidth) {
            this.delete();
        }
    }

    iterateRipple(r, newWidth) {
        r.style.width = newWidth + "px"
        r.style.height = newWidth + "px"
        r.style.left = this.xPos - (newWidth / 2)
        r.style.top =  this.yPos - (newWidth / 2)

        let transparency = 1 - (newWidth / this.maxWidth)
        r.style.borderColor = `rgba(${this.color}, ${transparency})`
        r.style.boxShadow = `0px 0px 10px rgba(${this.color}, ${transparency / 4})`
    }
};