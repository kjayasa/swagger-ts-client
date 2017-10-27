import * as fs from "fs";
import * as path from "path";
import * as Swagger from "swagger-schema-official";
import { createIfnotExists, createWriteStream } from "./fsUtil";
import { OperationsBuilder } from "./operation/operationsBuilder";
import { OperationsGroupRender } from "./renderer/operationsGroupRenderer";
import { TypesDefinitionRender } from "./renderer/TypesDefinitionRender";
import { ISettings, loadSettings, settings } from "./settings";
import { TypeBuilder } from "./type/typeBuilder";
import { getProvider } from "./SwaggerProvider/swaggerProvider"
import {logger} from "./logger";
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
       return await getProvider().provide(settings,logger);
        }
    private async render() {
        const swagger = await this.getSwagger();
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
        opsBuilder.getAllGroups().forEach(async(g) => {
            let opsName=settings.operations.outFileNameTransformFn(g.operationsGroupName);
            const stream = createWriteStream(settings.operations.outPutPath,opsName );
            logger.info(`Writing Operation ${opsName}  to ${settings.operations.outPutPath}`);
            await renderer.render(stream, g);
            stream.end();
        });
    }
}