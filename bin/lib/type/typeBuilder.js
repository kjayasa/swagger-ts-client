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
    getTypeNameInfo(schema) {
        return typeNameInfo_1.TypeNameInfo.getTypeNameInfoFromSchema(schema);
    }
    getTypeNameInfoParameter(param) {
        const schema = isBodyParam(param) ? param.schema : param;
        return this.getTypeNameInfo(schema);
    }
    getAllTypes() {
        return [...this.typeCache.values()];
    }
    findType(name) {
        return this.getAllTypes()
            .find((t) => t.swaggerTypeName === name);
    }
    findProp(type, propName) {
        return type.properties.find((p) => p.propertyName === propName);
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
        const properties = this.collectProperties(swaggerType);
        const required = swaggerType.required || [];
        for (const propertyName in properties) {
            if (properties.hasOwnProperty(propertyName)) {
                const prop = properties[propertyName];
                let typeName = typeNameInfo_1.TypeNameInfo.getTypeNameInfoFromSchema(prop);
                if (typeName.isInlineType) {
                    typeName = typeNameInfo_1.TypeNameInfo.fromSwaggerTypeName(type.typeNameInfo.partialTypeName + changeCase.pascalCase(propertyName));
                    this.inlineTypes.set(typeName.fullTypeName, prop);
                }
                type.addProperty(propertyName, typeName, required.indexOf(propertyName) != -1, prop.enum);
            }
        }
        this.collectInterfaces(swaggerType).forEach((i) => type.addInterface(i));
        return type;
    }
    collectProperties(swaggerType) {
        if (swaggerType.properties) {
            return swaggerType.properties;
        }
        if (swaggerType.allOf) {
            let res = {};
            swaggerType.allOf.forEach((st) => {
                res = Object.assign({}, res, this.collectProperties(st));
            });
            return res;
        }
        return {};
    }
    collectInterfaces(swaggerType) {
        if (swaggerType.$ref) {
            return [swaggerType.$ref.substring("#/definitions/".length)];
        }
        if (swaggerType.allOf) {
            let res = [];
            swaggerType.allOf.forEach((s) => res = res.concat(this.collectInterfaces(s)));
            return res;
        }
        return [];
    }
}
exports.TypeBuilder = TypeBuilder;
