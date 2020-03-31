"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeNameInfo_1 = require("./typeNameInfo");
class Type {
    constructor(swaggerTypeName) {
        this.swaggerTypeName = swaggerTypeName;
        this.properties = [];
        this.interfaces = [];
        this.typeNameInfo = typeNameInfo_1.TypeNameInfo.fromSwaggerTypeName(swaggerTypeName);
    }
    get typeName() {
        return this.typeNameInfo.typeName;
    }
    get extendsClause() {
        if (this.interfaces.length === 0) {
            return "";
        }
        return `extends ${this.interfaces.join(",")}`;
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
            enumValue,
        });
    }
    addInterface(interfaceName) {
        this.interfaces.push(interfaceName);
    }
}
exports.Type = Type;
