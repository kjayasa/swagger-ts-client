import { ISwaggerProvider }  from "./swaggerProvider"
import { ISettings } from "../settings";
import * as Swagger from "swagger-schema-official";
import { readFile } from "../fsUtil";
import {ILogger} from "../logger";
export class FsSwaggerProvider implements ISwaggerProvider{
    async provide(settings:ISettings,logger:ILogger):Promise<Swagger.Spec>{
        if(settings.swaggerFile){
            logger.info(`Reading swagger definitions from ${settings.swaggerFile}`);
            const data = await readFile(settings.swaggerFile, "utf8");
            return JSON.parse(data) as Swagger.Spec;
        }else{
            throw new Error("Filename to fetch swagger definition is not provided");
        }
     }
}