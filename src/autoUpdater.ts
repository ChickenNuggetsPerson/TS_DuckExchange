var cron = require('node-cron');
import * as fs from "fs";
const https = require('https');
const { spawn } = require('child_process');


class AutoUpdater {
    
    repoUrl : string;
    updateCron : string;
    currentVersion : Array<number>;

    constructor( repoUrl : string, updateCron : string) {
        this.repoUrl = repoUrl;
        this.updateCron = updateCron;
        this.currentVersion = this.parseVersionString(JSON.parse(fs.readFileSync("./package.json", "utf-8")).version)
    };

    async check() : Promise<void> {
        let result = this.checkVersions(this.currentVersion, this.parseVersionString(await this.fetchJSON(this.repoUrl)));
        console.log("Check For Update Result: ", result)
        if (result) { return; }

        console.log("Updating Code")

        const command = 'git pull';

        const child = spawn(command, {
            detached: true,
            stdio: 'ignore'
          });
          
          child.unref();

    }
   private parseVersionString( versionString : string ) : Array<number> {
        let strArray = versionString.split(".");
        let parsedArray : Array<number> = [];
        strArray.forEach(str => {
            parsedArray.push(JSON.parse(str));
        })
        return parsedArray;
    }
    private checkVersions( ver1 : Array<number>, ver2 : Array<number> ) : boolean {
        let result : boolean = true;
        for (let i = 0; i < ver1.length; i++) {
            if (ver1[i] != ver2[i]) { result = false; }
        }
        return result;
    }
    private async fetchJSON( url : string ) : Promise<string> {
        return new Promise((resolve) => {
            https.get(url, (response : any ) => {
                let data = '';
              
                // A chunk of data has been received.
                response.on('data', (chunk : any) => {
                  data += chunk;
                });
              
                // The whole response has been received.
                response.on('end', () => {
                  try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData.version)
                  } catch (error) {
                    resolve("");
                  }
                });
              }).on('error', (error : Error) => {
                console.error('Error fetching JSON:', error.message);
                resolve("");
              })
        })
    }
}



export { AutoUpdater }