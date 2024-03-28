var cron = require('node-cron');
import * as fs from "fs";
const https = require('https');
const { spawn } = require('child_process');


class AutoUpdater {
    
    repoUrl : string;
    currentVersion : string;

    constructor( repoUrl : string, updateCron : string) {
        this.repoUrl = repoUrl;
        this.currentVersion = JSON.parse(fs.readFileSync("./package.json", "utf-8")).version

        console.log("Running Version: ", this.currentVersion)
        console.log("Started Auto Updater")
        console.log("")
        cron.schedule(updateCron, () => {
            this.checkAndUpdate();
        });
        
        setTimeout(() => {
          this.check()
        }, 2000);
    };
    

    async check() : Promise<void> {
      let result = (this.currentVersion == await this.fetchJSON(this.repoUrl))
      if (result) { return; }

      console.log("Update Avaliable - Updating Tonight")

  }
    async checkAndUpdate() : Promise<void> {
        let result = (this.currentVersion == await this.fetchJSON(this.repoUrl))
        console.log("Check For Update Result: ", result)
        if (result) { return; }

        console.log("Updating Code")

        const command = 'git';
        const args = ["pull"]

        const child = spawn(command, args, {
            detached: true,
            stdio: 'ignore'
          });
          
          child.unref();

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