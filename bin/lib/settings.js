"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const deepMerge = require("mixin-deep");
const path = require("path");
const process = require("process");
const logger_1 = require("./logger");
exports.settings = {
    type: {
        typeAliasis: {
            "Int32": "number"
        },
        generatedTypes: "interface",
        membersOptional: true,
        templateFile: path.join(__dirname, "..", "..", "templates", "typeDefinetions.handlebars"),
        outPutPath: path.join(process.cwd(), "serverTypes", "serverTypes.ts"),
        templateTag: [
            `export type Nullable<T> = T;`,
            `export type List<T> = Array<T>;`
        ]
    },
    operations: {
        operationsGroupNameTransformFn: operationsGroupNameTransformFn,
        operationsNameTransformFn: operationsNameTransformFn,
        ungroupedOperationsName: "AllOperations",
        templateFile: path.join(__dirname, "..", "..", "templates", "operationsGroup.handlebars"),
        outPutPath: path.join(process.cwd(), "serverTypes", "httpClients"),
        outFileNameTransformFn: operationsGroupFilenameFn
    }
};
function operationsGroupFilenameFn(groupName) {
    return `${groupName}.ts`;
}
function operationsGroupNameTransformFn(operationName, httpVerb, operation) {
    if (operation.tags && operation.tags.length) {
        return `${operation.tags[0]}HttpSvc`;
    }
    else {
        return exports.settings.operations.ungroupedOperationsName;
    }
}
function operationsNameTransformFn(operationName, httpVerb, operation) {
    return operation.operationId.replace(`${operation.tags && operation.tags.length ? operation.tags[0] : ""}_`, httpVerb);
}
function loadSettings(configFile = null, override = {}) {
    if (configFile) {
        logger_1.logger.info(`Loading configuration from ${configFile}`);
    }
    const configPath = path.resolve(process.cwd(), configFile || "ts-client.config.js");
    let settingsFromFile = {};
    if (fs.existsSync(configPath)) {
        logger_1.logger.info(`Loading configuration from ${configPath}`);
        settingsFromFile = require(configPath);
    }
    else if (configFile) {
        throw new Error(`could not find config file ${configPath}`);
    }
    deepMerge(exports.settings, settingsFromFile, override);
    // overrides
    if (override.swaggerFile && exports.settings.swaggerProvider) {
        exports.settings.swaggerProvider = null;
    }
    if (override.swaggerProvider && exports.settings.swaggerFile) {
        exports.settings.swaggerFile = null;
    }
    return exports.settings;
}
exports.loadSettings = loadSettings;
