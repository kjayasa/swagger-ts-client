"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const settings_1 = require("../settings");
const renderer_1 = require("./renderer");
class TypesDefinitionRender extends renderer_1.AbstractRenderer {
    constructor() {
        super({ templatePath: settings_1.settings.type.templateFile });
    }
    getTypeAliases() {
        return Object.keys(settings_1.settings.type.typeAliases).map((alias) => {
            return {
                alias,
                typeDefinition: settings_1.settings.type.typeAliases[alias],
            };
        });
    }
    getRenderContext(types) {
        const declaredTypes = {
            typeAliases: this.getTypeAliases(),
            generatedTypes: settings_1.settings.type.generatedTypes,
            membersOptional: settings_1.settings.type.membersOptional ? "?" : "",
            types,
            tag: settings_1.settings.type.templateTag,
        };
        return declaredTypes;
    }
}
exports.TypesDefinitionRender = TypesDefinitionRender;
