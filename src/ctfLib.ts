
function charToNum(c : string) : number {
    c = c.toLowerCase()

    switch (c) {
        case "a":
            return 0;
        case "b":
            return 1;
        case "c":
            return 2;
        case "d":
            return 3;
        case "e":
            return 4;
        case "f":
            return 5;
        case "g":
            return 6;
        case "h":
            return 7;
        case "i":
            return 8;
        case "j":
            return 9;
        

        default:
            return -1;
    }
}
function numToChar(n : number) : string {
    let letters = "abcdefghij"
    if (n < 0 || n > 9) { 
        return ""
    }

    return letters.charAt(n)
}


// Generates a random CTF
function genCTF() {
    let number = Math.floor(Math.random() * 10000000000000000)
    let inside = (""+number).split("")

    let str = "";
    let runningNum = 0;
    inside.forEach(i => {
        str += numToChar(JSON.parse(i))
        runningNum += JSON.parse(i);
    })

    str += numToChar(runningNum % 10)

    return `SHS_CTF{${str}}`
}
// Validates a CTF
function validateCTF(ctf : string) : boolean {
    // Check begining and end
    if (!ctf.startsWith("SHS_CTF{") || !ctf.endsWith("}")) {
        return false;
    }

    // Convert chars into num array
    let value = ctf.replace("SHS_CTF{", "").replace("}", "").replace("-", "");
    let nums = [] 

    for (let i = 0; i < value.length; i++) {
        nums.push(charToNum(value.charAt(i)))
    }

    // Check if num array has -1, if so, invalidate the ctf
    let valid = true;
    nums.forEach(n => {
        if (n == -1) { valid = false; }
    })
    if (!valid) { return false; }

    if (nums.length < 10) { return false; }

    // Validate the CTF
    let runningNum = 0;
    for (let i = 0; i < nums.length - 1; i++) {
        runningNum += nums[i]
    }

    return nums[nums.length - 1] == runningNum % 10;
}


function getCTFValue(ctf : string) : number {
    if (!validateCTF(ctf)) { return 0; }

    return 100;
}


export { genCTF, validateCTF, getCTFValue}