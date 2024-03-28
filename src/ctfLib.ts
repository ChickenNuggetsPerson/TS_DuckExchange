import { RandomWordOptions, generateSlug } from "random-word-slugs";
const Sequelize = require('sequelize');


const ctfSequalizer = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'data/ctfs.sqlite',
});
const ctfTags = ctfSequalizer.define('ctf', {
    ctf: Sequelize.STRING,
    value: Sequelize.INTEGER,
    generated: Sequelize.BOOLEAN
})
async function initStorage() {
    await ctfTags.sync();
}

interface manualCTF {
    ctf: string;
    value: string;
}


async function addCTF(ctf: string, generated: boolean, value: number) : Promise<void> {
    if (await validateCTF(ctf)) { // Storage already contains ctf
        return;
    }

    await ctfTags.create({
        ctf: ctf,
        value: value,
        generated: generated
    })
    await ctfTags.sync();
}
async function deleteCTF(ctf: string) : Promise<void> {
    await ctfTags.sync();
    await ctfTags.destroy({where: {
        ctf: ctf,
    }})
    ctfTags.sync();
}

// Generates a random CTF
// Difficulty 1 - 3
function genCTF(diff: number) {
    if (diff < 1) { diff = 1 }
    if (diff > 3) { diff = 3 }

    let slug = "";

    switch (diff) {
        case 1: { // Easy
            const options1: RandomWordOptions<2> = {
                format: "kebab",
                categories: {
                    noun: ["animals", "place"],
                    adjective: ["color", "personality"],
                },
                partsOfSpeech: ["adjective", "noun"], 
            };
            slug = generateSlug(2, options1)
            
            break;
        }
        case 2: { // Medium

            const options2: RandomWordOptions<3> = {
                format: "kebab",
                categories: {
                    noun: ["food", "media"],
                    adjective: ["size", "shapes"],
                },
                partsOfSpeech: ["adjective", "adjective", "noun"], 
            };
            slug = generateSlug(3, options2)

            break;
        }
        case 3: { // Hard

            const options3: RandomWordOptions<4> = {
                format: "kebab",
                categories: {
                    noun: ["business", "technology", "transportation"],
                    adjective: ["appearance", "taste", "condition"],
                },
                partsOfSpeech: ["adjective", "adjective", "adjective", "noun"], 
            };
            slug = generateSlug(4, options3)

            break;
        }
    }
    
    let ctf = `SHS_CTF{${slug}}`
    addCTF(ctf, true, 0)
    return ctf
}
async function manualCreateCTF(ctf : string, value : number) : Promise<boolean> {
    if (await validateCTF(ctf)) {
        return false; // CTF already exists or is not valid
    }

    await addCTF(ctf, false, value)
    return true;
}
async function getManualCTFs() : Promise<manualCTF[]>{
    await ctfTags.sync();
    let databaseCTFs = await ctfTags.findAll({
        where: {
            generated: false
        }
    });

    let ctfs : manualCTF[] = []
    databaseCTFs.forEach((ctf: any) => {
        ctfs.push({ctf: ctf.ctf, value: ctf.value})
    });

    return ctfs;
}

// Validates a CTF
async function validateCTF(ctf : string) : Promise<boolean> {
    // Check begining and end
    if (!ctf.startsWith("SHS_CTF{") || !ctf.endsWith("}")) {
        return false;
    }

    await ctfTags.sync();
    let databaseCTF = await ctfTags.findAll({
        where: {
            ctf: ctf
        }
    });

    return databaseCTF.length > 0;
}

// Returns the CTF Database value if it was manually created
// Generated CTFS return 0
async function getCTFDatabaseValue(ctf : string) : Promise<number> {
    await ctfTags.sync();
    let databaseCTF = await ctfTags.findAll({
        where: {
            ctf: ctf
        }
    });
    try {
        if (databaseCTF[0].generated) {
            return 0;
        }
    } catch (err) { return 0; }

    return databaseCTF[0].value
}


async function getCTFValue(ctf : string) : Promise<number> {
    if (!await validateCTF(ctf)) { return 0; }

    let databaseCTFValue = await getCTFDatabaseValue(ctf);

    await deleteCTF(ctf)

    if (databaseCTFValue == 0) {
        let amt = ctf.split("-").length - 1 // Gets the amount of hyphens
        return 100 * amt;
    }

    return databaseCTFValue
}


export { genCTF, validateCTF, getCTFValue, initStorage, manualCreateCTF, deleteCTF, getManualCTFs}