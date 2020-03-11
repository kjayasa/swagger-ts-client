"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parsers_1 = require("../parsers/parsers");
const settings_1 = require("../settings");
const typeRefRegx = /#(?:\/[^\/]+)+\/([^\/]+)/;
function replaceAll(str, searchStr, replacement) {
    const searchRegx = new RegExp(searchStr.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), "g");
    return str.replace(searchRegx, replacement);
}
function getTypeAliases() {
    if (settings_1.settings.type.typeAliases) {
        return Object.keys(settings_1.settings.type.typeAliases).map((alias) => {
            return {
                alias,
                typeDefinition: settings_1.settings.type.typeAliases[alias],
            };
        });
    }
}
class TypeNameInfo {
    constructor(parsedResult) {
        this.parsedResult = parsedResult;
        //private parsedResult:ITypeNameParserAst=null;
        this.isInlineType = false;
        this.genericTypeArgsMap = null;
        this.substituteAliases();
        if (this.isGeneric) {
            this.genericTypeArgsMap = new Map(this.parsedResult.genericParams.map((ta, i) => [ta, parsers_1.typeNameParser.parse(TypeNameInfo.genericTypeNames[i])]));
        }
    }
    get typeName() {
        if (this.isGeneric) {
            return `${this.parsedResult.partialTypeName}<${[...this.genericTypeArgsMap.values()].map((i) => i.fullTypeName).join()}>`;
        }
        else {
            return this.parsedResult.partialTypeName;
        }
    }
    get fullTypeName() {
        return this.parsedResult.fullTypeName;
    }
    get isGeneric() {
        return this.parsedResult.genericParams && this.parsedResult.genericParams.length > 0;
    }
    get partialTypeName() {
        return this.parsedResult.partialTypeName;
    }
    static fromSwaggerTypeName(swaggerTypeName) {
        return new TypeNameInfo(parsers_1.typeNameParser.parse(swaggerTypeName));
    }
    static createInlineTypeName() {
        const ret = new TypeNameInfo(parsers_1.typeNameParser.parse(`SwaggerInlineType${this.inlineSchemaCount++}`));
        ret.isInlineType = true;
        return ret;
    }
    static isSwaggerTypePrimitive(swaggerTypeName) {
        return this.primitiveSwaggerTypes.includes(swaggerTypeName);
    }
    static getPrimitiveType(schema) {
        let type = "";
        if (schema.format) {
            type = this.primitiveTypesMapping[`${schema.type}+${schema.format}`];
            if (!type) {
                type = this.primitiveTypesMapping[schema.type];
            }
        }
        else {
            type = this.primitiveTypesMapping[schema.type];
        }
        if (!type) {
            throw new Error(`unsupported schema {type: ${schema.type},format:${schema.format}}`);
        }
        return type;
    }
    static isJsPrimitive(typename) {
        return this.primitiveJsTypes.includes(typename);
    }
    static getTypeNameInfoFromSchema(schema) {
        if (schema.$ref && schema.$ref[0] === "#") {
            const match = schema.$ref.match(typeRefRegx);
            if (match) {
                return TypeNameInfo.fromSwaggerTypeName(match[1]);
            }
        }
        else if (this.isSwaggerTypePrimitive(schema.type)) {
            return TypeNameInfo.fromSwaggerTypeName(this.getPrimitiveType(schema));
        }
        else if (schema.type === "array" && schema.items) {
            const itemSchema = (schema.items instanceof Array) ? schema.items[0] : schema.items;
            return TypeNameInfo.fromSwaggerTypeName(`Array<${this.getTypeNameInfoFromSchema(itemSchema).fullTypeName}>`);
        }
        else if (schema.type === "object" && schema.properties) {
            return TypeNameInfo.createInlineTypeName();
        }
        return TypeNameInfo.fromSwaggerTypeName("any");
    }
    static substitute(typeName, searchTypeAst, replacementAst) {
        typeName.parsedResult.composingTypes.forEach((ct) => {
            if (ct.fullTypeName === searchTypeAst.fullTypeName) {
                ct.partialTypeName = replacementAst.partialTypeName;
                ct.genericParams = replacementAst.genericParams;
            }
        });
        return typeName;
    }
    static substituteWithAlias(alias, typedef, typeName) {
        const aliasAst = parsers_1.typeNameParser.parse(alias);
        if (aliasAst.partialTypeName === typeName.partialTypeName) {
            if (aliasAst.genericParams && aliasAst.genericParams.length) {
                const typeDefAst = parsers_1.typeNameParser.parse(typedef);
                aliasAst.genericParams.forEach((agp) => {
                });
            }
            else {
                typeName.partialTypeName = typedef;
            }
        }
    }
    replaceWithGenericType(propertyTypeName) {
        for (const [typeArg, genericTypeName] of this.genericTypeArgsMap) {
            propertyTypeName = TypeNameInfo.substitute(propertyTypeName, typeArg, genericTypeName);
        }
        return propertyTypeName;
    }
    getComposingTypeNames(filterPrimitive = false) {
        if (filterPrimitive) {
            return this.parsedResult.composingTypes.filter((ct) => !TypeNameInfo.isJsPrimitive(ct.partialTypeName)).map((ct) => ct.partialTypeName);
        }
        else {
            return this.parsedResult.composingTypes.map((ct) => ct.partialTypeName);
        }
    }
    substituteAliases() {
        if (settings_1.settings.type.typeAliases) {
            getTypeAliases().forEach((alias) => {
                this.parsedResult.composingTypes.forEach((ct) => TypeNameInfo.substituteWithAlias(alias.alias, alias.typeDefinition, ct));
            });
        }
    }
}
TypeNameInfo.inlineSchemaCount = 1;
TypeNameInfo.genericTypeNames = "TUKABCDEFGHIJLMNOPQRSVWXYZ".split("");
TypeNameInfo.primitiveSwaggerTypes = ["integer", "number", "string", "boolean"];
TypeNameInfo.primitiveJsTypes = ["number", "string", "String", "boolean", "Date", "any", "void", "Array", "Map", "Set"];
TypeNameInfo.primitiveTypesMapping = {
    "integer+int32": "number",
    "integer+int64": "number",
    "number+double": "number",
    "number+float": "number",
    "number": "number",
    "integer": "number",
    "string": "string",
    "string+byte": "string",
    "string+binary": "string",
    "boolean": "boolean",
    "string+date": "Date",
    "string+date-time": "Date",
    "string+password": "string",
};
exports.TypeNameInfo = TypeNameInfo;
