#!/usr/bin/env node

export {ISettings,TsFromSwagger,ISwaggerProvider,HttpSwaggerProvider} from "./lib";
import {TsFromSwagger,logger} from "./lib";
import {getArgs} from "./cli";


async function main(){
    const args =  getArgs();
    const app = new TsFromSwagger(args.configFile,args.settings);
    await app.generateCode();
}

main()
    .then(() => {
        console.info("done");
    }).catch((error) => {        
        logger.error(error);
    });