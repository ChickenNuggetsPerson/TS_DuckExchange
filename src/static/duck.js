let mousePos = {
    x: 0,
    y: 0
}
document.addEventListener("mousemove", event => {
    mousePos.x = event.clientX
    mousePos.y = event.clientY
})
let innerBounds = document.getElementById("innerBoarder")


class Force {
    xForce;
    yForce;
    constructor(xForce, yForce) {
        this.xForce = xForce;
        this.yForce = yForce;
    }
}

class Duck {

    xPos = 0;
    yPos = 0;

    xVel = 0;
    yVel = 0;

    xAcc = 0;
    yAcc = 0;

    duck = document.createElement("object");

    mouseOver = false;

    constructor(simLayer) {
        let outerBorder = document.getElementById("outerBorder").getBoundingClientRect()
        this.duck.data = "/static/duck.svg"

        this.duck.classList.add("duck")

        let width = ((Math.random() * 30) + 40)
        this.duck.style.width = width + "px"
        this.duck.style.position = "absolute"

        this.duck.style.top = (Math.random() * (window.innerHeight - width))

        if ((Math.floor(Math.random() * 100) % 2) == 0) {
            this.duck.style.left = Math.random() * (outerBorder.left - width)
        } else {
            this.duck.style.left = (Math.random() * ( window.innerWidth - outerBorder.right - width)) + outerBorder.right
        }

        
        let rotationSpeed = Math.floor((Math.random() * 70) + 10)
        if (Math.floor(Math.random() * 200) % 2 == 0) {
            this.duck.style.animation = `rotatingCW ${rotationSpeed}s linear infinite`
        } else {
            this.duck.style.animation = `rotatingCCW ${rotationSpeed}s linear infinite`
        }

        this.duck.onmouseover = function(event) {
            mousePos.x = event.clientX
            mousePos.y = event.clientY
            this.mouseOver = true;
        };
        this.duck.onmouseout = function(event) {
            mousePos.x = event.clientX
            mousePos.y = event.clientY
            this.mouseOver = false;
        }

        this.duck.style.zIndex = 100

        simLayer.appendChild(this.duck)
    }

    forceWasApplied = false;
    applyForce(xForce, yForce) {
        this.xVel += xForce;
        this.yVel += yForce;
        this.forceWasApplied = true;
    }

    getCenterPos() {
        let bounds = this.duck.getBoundingClientRect()
        return {
            x: bounds.x + (bounds.width / 2),
            y: bounds.y + (bounds.height / 2)
        }
    }

    getPosOffset(pos1, pos2) {
        return {
            xOff: pos2.x - pos1.x,
            yOff: pos2.y - pos1.y
        }
    }

    checkInnerBounce() {

        if (this.elementsOverlap(this.duck, innerBounds)) {
            let bounds = innerBounds.getBoundingClientRect()
            let dist = this.getPosOffset({x: this.xPos, y: this.yPos}, {
                x: bounds.left + (bounds.width / 2),
                y: bounds.top + (bounds.height / 2)
            })

            //let xForce = (bounds.width / 1.2) - dist.xOff
            //let yForce = (bounds.height / 1.2) - dist.yOff

            this.applyForce(
                -dist.xOff / 3000, //xForce / 10000,
                -dist.yOff / 3000 //yForce / 10000
            )
        }
    }
    checkWindowBounce(duckBounds) {
        let borderForce = 0.2;

        let resetDist = 400;
        if (this.xPos > window.innerWidth + resetDist) {
            this.xPos = 0;
            this.xVel = this.xVel / 2
        }
        if (this.xPos < -resetDist) {
            this.xPos = window.innerWidth + (0.5 * resetDist)
            this.xVel = this.xVel / 2
        }
            
        
        if (this.yPos > window.innerHeight + resetDist) {
            this.yPos = 0;
            this.yVel = this.yVel / 2
        }
        if (this.yPos < -resetDist) {
            this.yPos = window.innerHeight + (0.5 * resetDist)        
            this.yVel = this.yVel / 2
        }
            

        let xForce = 0
        let yForce = 0

        if (duckBounds.right >= window.innerWidth + 10)
            xForce = -1
        if (duckBounds.left <= -10) 
            xForce = 1
        if (duckBounds.bottom >= window.innerHeight + 10)
            yForce = -1
        if (duckBounds.top <= -10)
            yForce = 1

        if (xForce != 0 || yForce != 0)
            this.applyForce(xForce * borderForce, yForce * borderForce)
    }
    elementsOverlap(el1, el2) {
        const domRect1 = el1.getBoundingClientRect();
        const domRect2 = el2.getBoundingClientRect();
      
        return !(
          domRect1.top + 10 > domRect2.bottom - 10||
          domRect1.right - 10 < domRect2.left + 10 ||
          domRect1.bottom - 10 < domRect2.top + 10 ||
          domRect1.left + 10 > domRect2.right - 10
        );
      }
    checkDuckBounce(otherDuck) {
        //let duckBounds = this.duck.getBoundingClientRect()
        //let otherBounds = otherDuck.getBoundingClientRect()

        //let bounceVel = 5;

        if (otherDuck.xVel == 0 && otherDuck.yVel == 0) {
            return
        }
            
        if (this.elementsOverlap(this.duck, otherDuck.duck)) {
            //this.applyForce( -this.xVel + (this.getDirection(this.xVel) * bounceVel), -this.yVel + (this.getDirection(this.yVel) * bounceVel))
            let force = this.getPosOffset({x: this.xPos, y:this.yPos}, {x: otherDuck.xPos, y:  otherDuck.yPos})
            this.applyForce(-(force.xOff / 1000), -(force.yOff / 1000))
        }
            
    }

    getDirection(val) {
        return (val > 0) ? 1 : -1
    }

    update() {

        //if (!this.duck.mouseOver && this.xVel == 0 && this.yVel && this.xAcc == 0 && this.yAcc == 0)
            //return;

        

        this.xPos = JSON.parse(this.duck.style.left.split("px")[0])
        this.yPos = JSON.parse(this.duck.style.top.split("px")[0])

        this.xVel += this.xAcc;
        this.yVel += this.yAcc;

        this.xAcc = 0;
        this.yAcc = 0;

        if (this.forceWasApplied) {
            this.forceWasApplied = false;
        } else {
            if (this.duck.mouseOver) {
            
                let force = this.getPosOffset(this.getCenterPos(), mousePos)
                this.xAcc = ((force.xOff % 500) * (this.getDirection(this.xAcc))) / 50;
                this.yAcc = ((force.yOff % 500) * (this.getDirection(this.yAcc))) / 50;
    
            } else {
                this.xVel = this.xVel * 0.99
                this.yVel = this.yVel * 0.99
            }

            if (Math.abs(this.xVel) < 0.08) { this.xVel = 0; }
            if (Math.abs(this.yVel) < 0.08) { this.yVel = 0; }
        }

        let bounds = this.duck.getBoundingClientRect()
        this.checkWindowBounce(bounds)
        this.checkInnerBounce()

        if (this.xVel != 0)
           this.duck.style.left = this.xPos + this.xVel
        if (this.yVel != 0)
           this.duck.style.top = this.yPos + this.yVel
    }
}