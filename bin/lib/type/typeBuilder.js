"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const changeCase = require("change-case");
const logger_1 = require("../logger");
const type_1 = require("./type");
const typeNameInfo_1 = require("./typeNameInfo");
function isBodyParam(param) {
    return param.schema ? true : false;
}
class TypeBuilder {
    constructor(definition) {
        this.definition = definition;
        this.typeCache = new Map();
        this.inlineTypes = new Map();
        this.buildTypeCache();
    }
    getTypeName(swaggerTypeName) {
        return typeNameInfo_1.TypeNameInfo.fromSwaggerTypeName(swaggerTypeName).typeName;
    }
    buildTypeCache() {
        logger_1.logger.info("Building Types..");
        Object.keys(this.definition).forEach((swaggerTypeName) => {
            const typename = this.getTypeName(swaggerTypeName);
            if (!this.typeCache.has(typename)) {
                const type = this.buildTypeFromDefinetion(swaggerTypeName);
                this.typeCache.set(typename, type);
            }
        });
        this.inlineTypes.forEach((schema, swaggerTypeName) => {
            this.typeCache.set(swaggerTypeName, this.buildType(swaggerTypeName, schema));
        });
    }
    buildTypeFromDefinetion(swaggerTypeName) {
        const swaggerType = this.definition[swaggerTypeName];
        return this.buildType(swaggerTypeName, swaggerType);
    }
    buildType(swaggerTypeName, swaggerType) {
        // let fullTypeName=this.splitGeneric(swaggerTypeName);
        const type = new type_1.Type(swaggerTypeName);
        const properties = swaggerType.properties;
        for (const propertyName of Object.keys(properties)) {
            const prop = properties[propertyName];
            let typeName = typeNameInfo_1.TypeNameInfo.getTypeNameInfoFromSchema(prop);
            if (typeName.isInlineType) {
                typeName = typeNameInfo_1.TypeNameInfo.fromSwaggerTypeName(type.typeNameInfo.partialTypeName +
                    changeCase.pascalCase(propertyName));
                this.inlineTypes.set(typeName.fullTypeName, prop);
            }
            let isRequired = false;
            if (swaggerType.required) {
                isRequired = swaggerType.required.includes(propertyName);
            }
            type.addProperty(propertyName, typeName, isRequired);
        }
        return type;
    }
    getTypeNameInfo(schema) {
        return typeNameInfo_1.TypeNameInfo.getTypeNameInfoFromSchema(schema);
    }
    getTypeNameInfoParameter(param) {
        const schema = isBodyParam(param)
            ? param.schema
            : param;
        const res = this.getTypeNameInfo(schema);
        return res;
    }
    getAllTypes() {
        return [...this.typeCache.values()];
    }
}
exports.TypeBuilder = TypeBuilder;
//# sourceMappingURL=typeBuilder.js.map