import { ISettings,settings } from "../settings";
import * as Swagger from "swagger-schema-official";
import {FsSwaggerProvider} from "./fsSwaggerProvider";
import {ILogger} from "../logger";

export interface ISwaggerProvider{
    provide:(settings:ISettings,logger:ILogger)=> Promise<Swagger.Spec>;
}

export function getProvider():ISwaggerProvider{
    if(settings.swaggerProvider && settings.swaggerProvider.provide){
        return settings.swaggerProvider;
    }else if(settings.swaggerFile){
        return new FsSwaggerProvider();
    }else{
        throw new Error("specfy a swagger definetion source");
    }
}