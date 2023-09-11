
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
  req.session.isAdmin = false;
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
  //  res.redirect("/admin")
  //  return
  }

  res.redirect("/admin/view/users")
})
app.get("/admin/view/users", (req: Request, res: Response) => {
  if (!isAdmin(req)) {
  //  res.redirect("/admin")
  //  return
  }

  res.render("adminUsers", {
    categories: JSON.stringify(getAllCategories()),
    users: JSON.stringify(getUsers())
  })
})
app.get("/admin/view/categories", (req: Request, res: Response) => {
  if (!isAdmin(req)) {
  //  res.redirect("/admin")
  //  return
  }

  res.render("adminCategories", {
    categories: JSON.stringify(getAllCategories()),
    users: JSON.stringify(getUsers())
  })
})





// Api Requests
app.get("/data/users", (req: Request, res: Response) => {
  res.json(getUsers());
})

// Admin Api

app.post("/data/admin/editUser", (req: Request, res: Response) => {
  //if (!isAdmin(req)) { res.status(400); res.send("Not authorized"); return; }

  editUser(req.body)
  res.status(200)
  res.send("OK")
})
app.post("/data/admin/addUser", (req: Request, res: Response) => {
  //if (!isAdmin(req)) { res.status(400); res.send("Not authorized"); return; }

  req.body.uuid = makeid(30)
  createUser(req.body)
  res.status(200)
  res.send("OK")
})
app.post("/data/admin/deleteUser", (req: Request, res: Response) => {
  //if (!isAdmin(req)) { res.status(400); res.send("Not authorized"); return; }
  removeUser(req.body)
  res.status(200)
  res.send("OK")
})

app.post("/data/admin/createCategory", (req: Request, res: Response) => {
  //if (!isAdmin(req)) { res.status(400); res.send("Not authorized"); return; }

  console.log(req.body)
  res.status(200)
  res.send("OK")
})
app.post("/data/admin/deleteCategory", (req: Request, res: Response) => {
  //if (!isAdmin(req)) { res.status(400); res.send("Not authorized"); return; }

  console.log(req.body)
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


function createCategory( cat: Category ) {
  categoryStorage.push(cat);
  saveCategories(categoryStorage);

  for (let i = 0; 0 < userStorage.length; i++) {
    userStorage[i].entries.push(new CategoryEntry(cat.uuid, 0));
  }
  saveUsers(userStorage);
}
function removeCategory( cat: Category) {
  categoryStorage.splice(categoryStorage.findIndex(item => item.uuid === cat.uuid), 1)
  saveCategories(categoryStorage);

  for (let i = 0; 0 < userStorage.length; i++) {
    userStorage[i].entries = userStorage[i].entries.filter(obj => obj.uuid !== cat.uuid);
  }
  saveUsers(userStorage);
}




function getUsers() : Array<User> { return userStorage; }
function createUser( usr: User ) {
  categoryStorage.forEach(cat => {
    //usr.entries.push(new CategoryEntry(cat.uuid, 0))
  })
  userStorage.push(usr);
  saveUsers(userStorage);
}
function removeUser( usr: User ) {
  userStorage.splice(userStorage.findIndex(item => item.uuid === usr.uuid), 1)
  saveUsers(userStorage);
}
function editUser( usr: User ) {
  for (let i = 0; i < userStorage.length; i++) {
    if (userStorage[i].uuid == usr.uuid) {
      userStorage[i] = usr
      break
    }
  }
  saveUsers(userStorage)
}




function loadEverything() {
  categoryStorage = readCategories();
  userStorage = readUsers();
}

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
  loadEverything();
});
