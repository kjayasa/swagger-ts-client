import * as commander from "commander";
import {HttpSwaggerProvider, ISettings} from "./lib";

const usageString = `

Executing swagger-ts-client with out any options, it tries to load settings from ./ts-client.config.js.`;

export function getArgs(){
    const program = require("commander");

    program
      .version("0.9.0")
      .usage(usageString)
      .option("-c, --config <path/to/config.file.js>", "use the configuration file from the path")
      .option("-s, --swaggerFile <path/to/swagger.doc.json>", "use swagger definition from the path")
      .option("-t, --typesOut <path/to/generate/types.ts>", "generate output types at the location")
      .option("-u, --url <http://url.to.swaggerDef/swagger/v1/docs>", "guse url as swagger source")
      .option("-o, --operationsOut <path/to/generate/operations/>", "generate operations at the location")
      .parse(process.argv);

    const settings: ISettings = {};

    if (program.swaggerFile){
        settings.swaggerFile = program.swaggerFile;
      }
    if (program.typesOut){
        settings.type = {
            outPutPath: program.typesOut,
        };
      }
    if (program.operationsOut){
        settings.operations = {
            outPutPath: program.operationsOut,
        };
      }
    if (program.url){
          settings.swaggerProvider = new HttpSwaggerProvider(program.url);
      }
    return {
        settings,
        configFile: program.config,
    };
}
