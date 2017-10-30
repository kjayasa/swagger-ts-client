"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const settings_1 = require("../settings");
const renderer_1 = require("./renderer");
class OperationsGroupRender extends renderer_1.AbstractRenderer {
    constructor() {
        super({ templatePath: settings_1.settings.operations.templateFile });
    }
    getTypeAliases() {
        return Object.keys(settings_1.settings.type.typeAliases).map((alias) => {
            return {
                alias,
                typeDefinition: settings_1.settings.type.typeAliases[alias],
            };
        });
    }
    getRenderContext(operationGroup) {
        const types = operationGroup.importedTypes;
        return {
            imports: {
                types: types && types.length ? types : null,
                path: this.getExportPath(),
            },
            operationGroup,
            tag: settings_1.settings.operations.templateTag,
        };
    }
    getExportPath() {
        const relativePath = path.relative(settings_1.settings.operations.outPutPath, settings_1.settings.type.outPutPath);
        const parsed = path.parse(relativePath);
        const moduleName = parsed.name;
        const dir = (parsed.dir).replace(/\\/g, "/"); // not using path.sep because we need to use "/" regardless of OS
        return `${(dir[0] === "." ? "" : `./`)}${dir ? `${dir}/` : ""}${moduleName}`;
    }
}
exports.OperationsGroupRender = OperationsGroupRender;
