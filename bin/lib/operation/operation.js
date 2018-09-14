"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const settings_1 = require("../settings");
const typeNameInfo_1 = require("../type/typeNameInfo");
const nonLitralRegx = /[^_$a-zA-Z0-9\xA0-\uFFFF]/g;
class Operation {
    constructor(httpVerb, url, swOpr, typeManager) {
        this.httpVerb = httpVerb;
        this.url = url;
        this.swOpr = swOpr;
        this.typeManager = typeManager;
        this.importedTypes = [];
        this.operationName = settings_1.settings.operations
            .operationsNameTransformFn(url, httpVerb, swOpr);
        this.groupName = settings_1.settings.operations
            .operationsGroupNameTransformFn(url, httpVerb, swOpr);
        this.build();
    }
    build() {
        this.responsesType = this.getResponse();
        if (this.swOpr.parameters && this.swOpr.parameters.length) {
            this.operationParams = this.swOpr.parameters
                .map((p) => this.buildParam(p));
        }
    }
    getResponse() {
        const resps = this.swOpr.responses;
        if (resps) {
            for (const rt of Object.keys(resps)) {
                const nrt = (parseInt(rt, 10) / 100.0);
                if (Math.round(nrt) === 2) {
                    const schema = resps[rt].schema;
                    if (schema) {
                        const retType = this.typeManager.getTypeNameInfo(schema);
                        if (!typeNameInfo_1.TypeNameInfo.isJsPrimitive(retType.fullTypeName)) {
                            this.addImportedType(retType);
                        }
                        return retType.fullTypeName;
                    }
                }
            }
        }
        return "void";
    }
    buildParam(param) {
        const paramType = this.typeManager.getTypeNameInfoParameter(param);
        this.addImportedType(paramType);
        return {
            paramName: param.name,
            paramDisplayName: param.name.replace(nonLitralRegx, "_"),
            paramType: paramType.fullTypeName,
            inBody: param.in === "body",
            inPath: param.in === "path",
            inQuery: param.in === "query",
            optional: paramType.isOptional,
        };
    }
    addImportedType(typename) {
        this.importedTypes =
            this.importedTypes.concat(typename.getComposingTypeNames(true));
    }
}
exports.Operation = Operation;
//# sourceMappingURL=operation.js.map