"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fsUtil_1 = require("./fsUtil");
const operationsBuilder_1 = require("./operation/operationsBuilder");
const operationsGroupRenderer_1 = require("./renderer/operationsGroupRenderer");
const TypesDefinitionRender_1 = require("./renderer/TypesDefinitionRender");
const settings_1 = require("./settings");
const typeBuilder_1 = require("./type/typeBuilder");
const swaggerProvider_1 = require("./SwaggerProvider/swaggerProvider");
const logger_1 = require("./logger");
class TsFromSwagger {
    constructor(configFile = null, override = {}) {
        logger_1.logger.info(`Starting...`);
        settings_1.loadSettings(configFile, override);
    }
    generateCode() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.createOutDirs();
            yield this.render();
        });
    }
    getSwagger() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield swaggerProvider_1.getProvider().provide(settings_1.settings, logger_1.logger);
        });
    }
    render() {
        return __awaiter(this, void 0, void 0, function* () {
            const swagger = yield this.getSwagger();
            const typeManager = new typeBuilder_1.TypeBuilder(swagger.definitions);
            yield this.renderTypes(typeManager);
            yield this.renderOperationGroups(swagger.paths, typeManager);
        });
    }
    createOutDirs() {
        return __awaiter(this, void 0, void 0, function* () {
            yield fsUtil_1.createIfnotExists(settings_1.settings.type.outPutPath);
            yield fsUtil_1.createIfnotExists(settings_1.settings.operations.outPutPath);
        });
    }
    renderTypes(typeManager) {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = fsUtil_1.createWriteStream(settings_1.settings.type.outPutPath), renderer = new TypesDefinitionRender_1.TypesDefinitionRender();
            logger_1.logger.info(`Writing Types to ${settings_1.settings.type.outPutPath}`);
            yield renderer.render(stream, typeManager.getAllTypes());
            stream.end();
        });
    }
    renderOperationGroups(paths, typeManager) {
        return __awaiter(this, void 0, void 0, function* () {
            const renderer = new operationsGroupRenderer_1.OperationsGroupRender(), opsBuilder = new operationsBuilder_1.OperationsBuilder(paths, typeManager);
            opsBuilder.getAllGroups().forEach((g) => __awaiter(this, void 0, void 0, function* () {
                let opsName = settings_1.settings.operations.outFileNameTransformFn(g.operationsGroupName);
                const stream = fsUtil_1.createWriteStream(settings_1.settings.operations.outPutPath, opsName);
                logger_1.logger.info(`Writing Operation ${opsName}  to ${settings_1.settings.operations.outPutPath}`);
                yield renderer.render(stream, g);
                stream.end();
            }));
        });
    }
}
exports.TsFromSwagger = TsFromSwagger;
//# sourceMappingURL=tsFromSwagger.js.map