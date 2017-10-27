"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const settings_1 = require("../settings");
const renderer_1 = require("./renderer");
class TypesDefinitionRender extends renderer_1.AbstractRenderer {
    constructor() {
        super({ templatePath: settings_1.settings.type.templateFile });
    }
    gettypeAliasis() {
        return Object.keys(settings_1.settings.type.typeAliasis).map((alias) => {
            return {
                alias,
                typeDefinition: settings_1.settings.type.typeAliasis[alias],
            };
        });
    }
    getRenderContext(types) {
        const declaredTypes = {
            typeAliasis: this.gettypeAliasis(),
            generatedTypes: settings_1.settings.type.generatedTypes,
            membersOptional: settings_1.settings.type.membersOptional ? "?" : "",
            types,
            tag: settings_1.settings.type.templateTag,
        };
        return declaredTypes;
    }
}
exports.TypesDefinitionRender = TypesDefinitionRender;
