import * as fs from "fs";
import * as path from "path";
import * as process from "process";
import * as Swagger from "swagger-schema-official";
import {logger} from "./logger";
import {registerHandleBarsHelpers} from "./renderer/renderer";
import {ISwaggerProvider} from "./swaggerProvider/swaggerProvider";
import  {deepMerge} from "./utils/deepMerge";

export type HttpVerb= "get"|"put"|"post"|"delete"|" options"|"head"|" patch";

export type GeneratedType  = "type"|"interface"|"class";

export type IOperationsTransformFn = (operationName: string, httpVerb: HttpVerb , operation: Swagger.Operation) => string;

export type IGroupFileNameTransformFn = (groupName: string) => string;

export type IHandleBarHelper = (...any) => string;

export interface ISettings{
    swaggerFile?: string;
    swaggerProvider?: ISwaggerProvider;
    templateHelpers?: {
        [index: string]: IHandleBarHelper,
    };
    type?: {
        typeAliases?: {
            [index: string]: string,
        },
        generatedTypes?: GeneratedType,
        membersOptional?: boolean,
        templateFile?: string,
        outPutPath?: string,
        templateTag?: any,
    };
    operations?: {
        operationsGroupNameTransformFn?: IOperationsTransformFn,
        operationsNameTransformFn?: IOperationsTransformFn,
        ungroupedOperationsName?: string,
        templateFile?: string,
        outPutPath?: string
        outFileNameTransformFn?: IGroupFileNameTransformFn,
        templateTag?: any,
    };

}

export const settings: ISettings  = {
    type: {
        typeAliases: {
            Int32: "number",
        },
        generatedTypes: "interface",
        membersOptional: true,
        templateFile: path.join(__dirname, "..", "..", "templates", "typeDefinitions.handlebars"),
        outPutPath: path.join(process.cwd(), "serverTypes", "serverTypes.ts"),
    },
    operations: {
        operationsGroupNameTransformFn,
        operationsNameTransformFn,
        ungroupedOperationsName: "AllOperations",
        templateFile: path.join(__dirname, "..", "..", "templates", "operationsGroup.handlebars"),
        outPutPath: path.join(process.cwd(), "serverTypes", "httpClients"),
        outFileNameTransformFn: operationsGroupFilenameFn,
    },
};

function operationsGroupFilenameFn(groupName){
    return `${groupName}.ts`;
}

function operationsGroupNameTransformFn(operationName, httpVerb , operation){
    if (operation.tags && operation.tags.length ){
        return `${operation.tags[0]}HttpSvc`;
    }
    else{
        return settings.operations.ungroupedOperationsName;
    }
}
function operationsNameTransformFn(operationName, httpVerb , operation){
   return operation.operationId.replace(`${operation.tags && operation.tags.length ? operation.tags[0] : ""}_`, httpVerb);
}

export function loadSettings(configFile: string= null, override: ISettings= {}){
    if (configFile){
        logger.info(`Loading configuration from ${configFile}`);
    }
    const configPath = path.resolve(process.cwd(), configFile || "ts-client.config.js");
    let settingsFromFile = {};
    if (fs.existsSync(configPath)){
        logger.info(`Loading configuration from ${configPath}`);
        settingsFromFile = require(configPath);
    }else if (configFile){
        throw new Error(`could not find config file ${configPath}`);
    }

    deepMerge(settings, settingsFromFile, override);

    // overrides
    if (override.swaggerFile && settings.swaggerProvider){
        settings.swaggerProvider = null;
    }
    if (override.swaggerProvider && settings.swaggerFile){
        settings.swaggerFile = null;
    }

    registerHandleBarsHelpers(settings);

    return settings;
}
