
import express, { Express, Request, Response , Application } from 'express';
import * as fs from 'fs';

import { Category, CategoryEntry, User } from './lib';


const app: Application = express();
const port = 8000;

app.set('view engine', 'pug');
app.set('views', "./src/views");
app.use('/static', express.static('./src/static'));

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.render("stats", {
    colNames: JSON.stringify(getActiveCategories())
  });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
  loadEverything();
});



app.get("/data/users", (req: Request, res: Response) => {
  res.json(getUsers());
})

app.get("/data/admin/categories", (req: Request, res: Response) => {
  res.json(getAllCategories())
})

app.post("/data/admin/editUser", (req: Request, res: Response) => {
  console.log(req.body)
})
app.post("/data/admin/addUser", (req: Request, res: Response) => {
  console.log(req.body)
})
app.post("/data/admin/deleteUser", (req: Request, res: Response) => {
  console.log(req.body)
})

app.post("/data/admin/createCategory", (req: Request, res: Response) => {
  console.log(req.body)
})
app.post("/data/admin/deleteCategory", (req: Request, res: Response) => {
  console.log(req.body)
})



let categoryStorage : Array<Category>;
let userStorage : Array<User>;



function readCategories() : Array<Category> { return JSON.parse(fs.readFileSync('./data/categories.json', 'utf-8')); }
function saveCategories(list : Array<Category>) { fs.writeFileSync("./data/categories.json", JSON.stringify(list)); }

function readUsers() : Array<User> { return JSON.parse(fs.readFileSync('./data/users.json', 'utf-8')); }
function saveUsers(list : Array<User>) { fs.writeFileSync("./data/users.json", JSON.stringify(list)); }



function getActiveCategories() : Array<string> {
  let categories: string[] = [];
  categoryStorage.forEach(category => {
    if (category.isVisable) { categories.push(category.name) }
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
  categoryStorage = categoryStorage.filter(obj => obj.uuid !== cat.uuid);
  saveCategories(categoryStorage);

  for (let i = 0; 0 < userStorage.length; i++) {
    userStorage[i].entries = userStorage[i].entries.filter(obj => obj.uuid !== cat.uuid);
  }
  saveUsers(userStorage);
}




function getUsers() : Array<User> { return userStorage; }
function createUser( usr: User ) {
  categoryStorage.forEach(cat => {
    usr.entries.push(new CategoryEntry(cat.uuid, 0))
  })
  userStorage.push(usr);
  saveUsers(userStorage);
}
function removeUser( usr: User ) {
  userStorage = userStorage.filter(obj => obj.uuid !== usr.uuid);
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