"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeNameInfo_1 = require("./typeNameInfo");
class Type {
    constructor(swaggerTypeName) {
        this.swaggerTypeName = swaggerTypeName;
        this.properties = [];
        this.typeNameInfo = typeNameInfo_1.TypeNameInfo.fromSwaggerTypeName(swaggerTypeName);
    }
    get typeName() {
        return this.typeNameInfo.typeName;
    }
    get isGeneric() {
        return this.typeNameInfo.isGeneric;
    }
    get partialTypeName() {
        return this.typeNameInfo.partialTypeName;
    }
    addProperty(propertyName, propertyType, required, enumValue) {
        if (this.isGeneric) {
            propertyType = this.typeNameInfo.replaceWithGenericType(propertyType);
        }
        this.properties.push({
            propertyName,
            typeName: propertyType.fullTypeName,
            required: required ? "" : "?",
            enumValue: enumValue,
        });
    }
}
exports.Type = Type;
