import { ISwaggerProvider }  from "./SwaggerProvider"
import { ISettings } from "../settings";
import * as Swagger from "swagger-schema-official";
import { readFile } from "../fsUtil";
import {ILogger} from "../logger";
export class FsSwaggerProvider implements ISwaggerProvider{
    async provide(settings:ISettings,logger:ILogger):Promise<Swagger.Spec>{
        if(settings.swaggerFile){
            logger.info(`Reading swagger definetions from ${settings.swaggerFile}`);
            const data = await readFile(settings.swaggerFile, "utf8");
            return JSON.parse(data) as Swagger.Spec;
        }else{
            throw new Error("Filename fetch swagger definetion is not specfied");
        }
     }
}