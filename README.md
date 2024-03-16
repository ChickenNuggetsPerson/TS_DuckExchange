# Duck Exchange Website

## Todo

- [X] Add auto updater through github
- [ ] Make user hide switch


## How To Install

### Mac and Linux

1. Run `sh setup.sh` to setup the project <br>
2. Run `sh start.sh` to start the server

### Windows

1. create a `data` directory <br>
2. create a `dist` directory <br>
3. copy, paste, and rename `./setupfiles/empty.json` into `./data/categories.json`
4. copy, paste, and rename `./setupFiles/empty.json` into  `./data/users.json`
5. copy and paste `./setupFiles/admins.json` into `./data/admins.json` 
6. In the main directory, run `npm install`
7. To run the server, run `npx tsc && node dist/main.js`

## Creating an Admin Account

1. Stop the server
2. (Assuming you have run the server before and compiled the code) run `node dist/main.js [username] [password]`
3. Stop the server
4. Start the server again with `start.sh` or `npx tsc && node dist/main.js`
