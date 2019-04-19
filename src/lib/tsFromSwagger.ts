import * as fs from "fs";
import * as path from "path";
import * as Swagger from "swagger-schema-official";
import {logger} from "./logger";
import { OperationsBuilder } from "./operation/operationsBuilder";
import { OperationsGroupRender } from "./renderer/operationsGroupRenderer";
import { TypesDefinitionRender } from "./renderer/typesDefinitionRender";
import { ISettings, loadSettings, settings } from "./settings";
import { getProvider } from "./swaggerProvider/swaggerProvider";
import { TypeBuilder } from "./type/typeBuilder";
import { createIfnotExists, createWriteStream } from "./utils/fsUtil";
export class TsFromSwagger {
    constructor(configFile: string = null, override: ISettings = {}) {
        logger.info(`Starting...`);
        loadSettings(configFile, override);
    }
    public async generateCode() {
        await this.createOutDirs();
        await this.render();
    }
    private async getSwagger() {
       return await getProvider().provide(settings, logger);
    }
    private adjustSwaggerPaths(swagger: Swagger.Spec) {
        let base = swagger.basePath;
        const host: string = swagger.host;
        const schemes = swagger.schemes;
        const newPaths: {[pathName: string]: Swagger.Path} = {};

        if (base && base.endsWith("/")) {
            base = base.substring(0, base.length - 2);
        }

        const checkPathParam = (name: string, paths: Swagger.Path) => {
            for (const k of Object.keys(paths)) {
                const params = paths[k].parameters;
                if (params) {
                    for (let i = 0; i < params.length; i++) {
                        const param = params[i];

                        if (param.in && param.in === "path" && name === param.name) {
                            if (param.type === "string") {
                                return "encodeURIComponent(" + name + ")";
                            }
                            else {
                                return name;
                            }
                        }
                    }
                }
            }
        };

        Object.keys(swagger.paths).forEach((p) => {
            let fixedPath = p;
            if (p.indexOf("{") > -1) {
                fixedPath = fixedPath.replace(/(\{.*?\})/gm, (m) => {
                    m = m.substr(1, m.length - 2);
                    const val = checkPathParam(m, swagger.paths[p]);

                    if (val) {
                        return "${" + val + "}";
                    }
                    else {
                        throw Error(`Unknown path parameter "${m}" in "${p}"`);
                    }
                });
            }
            if (settings.operations.useHostAndBasePath) {
                if (base) {
                    if (!fixedPath.startsWith("/")) {
                        fixedPath = `/${fixedPath}`;
                    }

                    fixedPath = base + fixedPath;
                }

                fixedPath = host !== undefined ? host + fixedPath : fixedPath;

                if (schemes !== undefined && schemes.length > 0){
                    if (schemes.filter(function(x) {return x.toLowerCase() == "https"; })){
                        fixedPath = "https://" + fixedPath;
                    } else {
                        fixedPath = "http://" + fixedPath;
                    }
                }
            }

            newPaths[fixedPath] = swagger.paths[p];
        });

        swagger.paths = newPaths;
    }
    private async render() {
        const swagger = await this.getSwagger();
        this.adjustSwaggerPaths(swagger);
        const typeManager = new TypeBuilder(swagger.definitions);
        await this.renderTypes(typeManager);
        await this.renderOperationGroups(swagger.paths, typeManager);
    }
    private async createOutDirs() {
        await createIfnotExists(settings.type.outPutPath);
        await createIfnotExists(settings.operations.outPutPath);
    }

    private async renderTypes(typeManager) {
        const stream = createWriteStream(settings.type.outPutPath),
            renderer = new TypesDefinitionRender();

        logger.info(`Writing Types to ${settings.type.outPutPath}`);

        await renderer.render(stream, typeManager.getAllTypes());
        stream.end();
    }

    private async renderOperationGroups(paths: {
        [pathName: string]: Swagger.Path,
    }, typeManager) {
        const renderer = new OperationsGroupRender(),
            opsBuilder = new OperationsBuilder(paths, typeManager);
        opsBuilder.getAllGroups().forEach(async (g) => {
            const opsName = settings.operations.outFileNameTransformFn(g.operationsGroupName);
            const stream = createWriteStream(settings.operations.outPutPath, opsName );
            logger.info(`Writing Operation ${opsName}  to ${settings.operations.outPutPath}`);
            await renderer.render(stream, g);
            stream.end();
        });
    }
}
