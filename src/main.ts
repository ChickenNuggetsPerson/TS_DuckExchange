
import express, { Express, Request, Response , Application } from 'express';
import session from 'express-session';
declare module 'express-session' {
  interface Session {
    isAdmin: boolean;
  }
}

let FileStore = require('session-file-store')(session);

import * as fs from 'fs';

import { Category, CategoryEntry, User } from './lib';
import { AutoUpdater } from './autoUpdater';


function makeid(length: number) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

const crypto = require('crypto');

function encrypt(text : string, password : string) {
    const salt = crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return salt.toString('hex') + iv.toString('hex') + encrypted + authTag;
}
function decrypt(encryptedText : string, password : string) {
    try {
        const salt = Buffer.from(encryptedText.slice(0, 32), 'hex');
        const iv = Buffer.from(encryptedText.slice(32, 64), 'hex');
        const encrypted = encryptedText.slice(64, -32);
        const authTag = Buffer.from(encryptedText.slice(-32), 'hex');
        const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512');
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch(err) { 
        return ""
    }
}



const app: Application = express();
const port = 8080;

app.set('view engine', 'pug');
app.set('views', "./src/views");
app.use('/static', express.static('./src/static'));

app.use(express.json());
let fileStoreOptions = {}
app.use(session({
  secret: 'duck exchange',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
  store: new FileStore(fileStoreOptions)
}));

function isAdmin(req: Request) : Boolean {
  return req.session.isAdmin
}

// Page Get Requests
app.get('/', (req: Request, res: Response) => {
  res.render("stats", {
    colNames: JSON.stringify(getActiveCategories())
  });
});
app.get('/admin', (req: Request, res: Response) => {
  if (!isAdmin(req)) {
    res.render("login")
    return
  } 

  res.redirect("/admin/view")
})
app.get("/admin/view", (req: Request, res: Response) => {
  if (!isAdmin(req)) {
    res.redirect("/admin")
    return
  }

  res.redirect("/admin/view/users")
})
app.get("/admin/view/users", (req: Request, res: Response) => {
  if (!isAdmin(req)) {
    res.redirect("/admin")
    return
  }

  res.render("adminUsers", {
    categories: JSON.stringify(getAllCategories()),
    users: JSON.stringify(getUsers())
  })
})
app.get("/admin/view/categories", (req: Request, res: Response) => {
  if (!isAdmin(req)) {
    res.redirect("/admin")
    return
  }

  res.render("adminCategories", {
    categories: JSON.stringify(getAllCategories()),
    users: JSON.stringify(getUsers())
  })
})
app.get("/admin/view/genCTF", (req: Request, res: Response) => {
  if (!isAdmin(req)) {
    res.redirect("/admin")
    return
  }


  let ctfs = []
  for (let i = 0; i < 10; i++) {
    ctfs.push(genCTF())
  }

  res.render("adminGenCTF", {
    ctfs: JSON.stringify(ctfs)
  })
})
app.get("/admin/forceUpdate", async (req: Request, res: Response) => {
  if (!isAdmin(req)) {
    res.status(400);
    res.send("Not Authorized");
    return
  }
  
  console.log("Force Update Called")

  await updater.check();
  res.send("No Update Avaliable")
})


app.get("/admin/view/genHash", (req: Request, res: Response) => {

  if (!isAdmin(req)) {
    res.status(400);
    res.send("Not Authorized");
    return
  }

  res.render("adminGenHash", {})
})
app.post('/admin/genHash', (req, res) => {
  if (!isAdmin(req)) { res.status(400); res.send("Not authorized"); return; }

  createAdmin(req.body.username, req.body.password)

  res.json({
    result: encrypt(req.body.username, req.body.password)
  })
});



// Api Requests
app.get("/data/users", (req: Request, res: Response) => {
  res.json(getUsers());
})
app.post("/data/users/submitCTF", (req: Request, res: Response) => {
  // if (!isAdmin(req)) { res.status(400); res.send("Not authorized"); return; }

  // console.log(req.body)

  let result = addCTFValue(req.body.userUUID, req.body.ctf)

  if (result) {
    res.status(200)
    res.send("OK")
  } else {
    res.status(200)
    res.send("Bad CTF")
  }
})


// Admin Api

app.post('/admin/login', (req, res) => {

  let users = JSON.parse(fs.readFileSync("./data/admins.json", "utf-8"))
  let found = false;
  users.forEach((user: string) => {
      if (decrypt(user, req.body.password) == req.body.username) {
          found = true;
      }   
  });
  if (!found) {
      req.session.isAdmin = false;
      res.status(401);
      res.send('None shall pass');
      return;
  }
  req.session.isAdmin = true;
  setTimeout(() => {
      res.status(200);
      res.send('Ok');
  }, 1000);
});

app.post("/data/admin/editUser", (req: Request, res: Response) => {
  if (!isAdmin(req)) { res.status(400); res.send("Not authorized"); return; }

  editUser(req.body)
  res.status(200)
  res.send("OK")
})
app.post("/data/admin/addUser", (req: Request, res: Response) => {
  if (!isAdmin(req)) { res.status(400); res.send("Not authorized"); return; }

  req.body.uuid = makeid(30)
  createUser(req.body)
  res.status(200)
  res.send("OK")
})
app.post("/data/admin/deleteUser", (req: Request, res: Response) => {
  if (!isAdmin(req)) { res.status(400); res.send("Not authorized"); return; }
  removeUser(req.body)
  res.status(200)
  res.send("OK")
})

app.post("/data/admin/editCategory", (req: Request, res: Response) => {
  if (!isAdmin(req)) { res.status(400); res.send("Not authorized"); return; }

  editCategory(req.body)
  res.status(200)
  res.send("OK")
})
app.post("/data/admin/createCategory", (req: Request, res: Response) => {
  if (!isAdmin(req)) { res.status(400); res.send("Not authorized"); return; }

  req.body.uuid = makeid(30)
  req.body.canRemove = true;
  createCategory(req.body)
  res.status(200)
  res.send("OK")
})
app.post("/data/admin/deleteCategory", (req: Request, res: Response) => {
  if (!isAdmin(req)) { res.status(400); res.send("Not authorized"); return; }

  removeCategory(req.body)
  res.status(200)
  res.send("OK")
})
app.post("/data/admin/setCategoryVisablity", (req: Request, res: Response) => {
  if (!isAdmin(req)) { res.status(400); res.send("Not authorized"); return; }

  setCategoryVisablity(req.body.uuid, req.body.newShow)
  res.status(200)
  res.send("OK")
})


let categoryStorage : Array<Category>;
let userStorage : Array<User>;



function readCategories() : Array<Category> { return JSON.parse(fs.readFileSync('./data/categories.json', 'utf-8')); }
function saveCategories(list : Array<Category>) { fs.writeFileSync("./data/categories.json", JSON.stringify(list)); }

function readUsers() : Array<User> { return JSON.parse(fs.readFileSync('./data/users.json', 'utf-8')); }
function saveUsers(list : Array<User>) { fs.writeFileSync("./data/users.json", JSON.stringify(list)); }



function getActiveCategories() : Array<Category> {
  let categories: Category[] = [];
  categoryStorage.forEach(category => {
    if (category.isVisable) { categories.push(category) }
  })
  return categories;
}
function getAllCategories() : Array<Category> { return categoryStorage; }


function editCategory( cat: Category ) {
  for (let i = 0; i < categoryStorage.length; i++) {
    if (categoryStorage[i].uuid == cat.uuid) {
      categoryStorage[i] = cat
      break
    }
  }
  saveCategories(categoryStorage)
}
function createCategory( cat: Category ) {
  categoryStorage.push(cat);
  saveCategories(categoryStorage);

  for (let i = 0; i < userStorage.length; i++) {
    userStorage[i].entries.push(new CategoryEntry(cat.uuid, 0, true));
  }
  saveUsers(userStorage);
}
function removeCategory( cat: Category) {

  if (!cat.canRemove) { return; }

  categoryStorage.splice(categoryStorage.findIndex(item => item.uuid === cat.uuid), 1)
  saveCategories(categoryStorage);

  for (let i = 0; i < userStorage.length; i++) {
    userStorage[i].entries = userStorage[i].entries.filter(obj => obj.uuid !== cat.uuid);
  }
  saveUsers(userStorage);
}
function setCategoryVisablity( uuid: string, newShow : boolean) {
  for (let i = 0; i < userStorage.length; i++) {
    for (let z = 0; z < userStorage[i].entries.length; z++) 
      if (userStorage[i].entries[z].uuid == uuid)
        userStorage[i].entries[z].show = newShow;
  }
}




function getUsers() : Array<User> { return userStorage; }
function createUser( usr: User ) {
  categoryStorage.forEach(cat => {
    //usr.entries.push(new CategoryEntry(cat.uuid, 0, true))
  })
  userStorage.push(usr);
  saveUsers(userStorage);
}
function removeUser( usr: User ) {
  userStorage.splice(userStorage.findIndex(item => item.uuid === usr.uuid), 1)
  saveUsers(userStorage);
}
function editUser( usr: User ) {
  
  let index = userStorage.findIndex(user => user.uuid === usr.uuid)
  userStorage[index] = usr

  saveUsers(userStorage)
}
function getUserFromUUID( uuid: string ) : User | undefined {
  return userStorage.find(usr => usr.uuid === uuid)
}


import { getCTFValue, genCTF } from './ctfLib';
function addCTFValue( userUUID: string, ctf: string ) : boolean {
  
  // Get the CTF value
  let value = getCTFValue(ctf)
  if (value == 0) { return false; }

  // Get the user object
  let user = getUserFromUUID(userUUID)
  if (user === undefined) { return false; } // Check if user exists

  // Find category index and incremend the value
  let index = user.entries.findIndex(entry => entry.uuid === "ctfPoints")
  let currentPoints = user.entries[index].value
  user.entries[index].value = Number(currentPoints) + Number(value)

  editUser(user)
  return true;
}




function loadEverything() {
  categoryStorage = readCategories();
  userStorage = readUsers();
}


function createAdmin(username : string, password : string) {
  let newUser = encrypt(username, password)
  let users = JSON.parse(fs.readFileSync("./data/admins.json", 'utf-8'))
  users.push(newUser)
  fs.writeFileSync("./data/admins.json", JSON.stringify(users))
}


let updater : AutoUpdater;

let address = ""
require('dns').lookup(require('os').hostname(), function (err : any, add : any, fam : any) {
  address = add;
  startServer();
})


async function printAnimation() {
  return new Promise(resolve => {
    let text = fs.readFileSync("./src/assets/logo.txt", 'utf-8')
    let split = text.split("\n")
    for (let i = 0; i < split.length; i++) {
      setTimeout(() => {
        console.log(split[i])
        if (i == split.length - 1) {
          resolve(true)
        }
      }, 100 * i);
    }
  })
}

async function startServer() {

  await printAnimation();

  updater = new AutoUpdater("https://raw.githubusercontent.com/ChickenNuggetsPerson/TS_DuckExchange/main/package.json", "0 * 0 * * *");

  app.listen(port, () => {
  
    console.log(`Server started at locataion ${address}:${port}`);
  
    if (process.argv.length == 4) {
      createAdmin(process.argv[2], process.argv[3])
      console.log("Created User: " + process.argv[2])
    }
  
    loadEverything();

    console.log(genCTF())
  });
}
