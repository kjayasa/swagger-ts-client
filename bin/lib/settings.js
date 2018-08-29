"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const process = require("process");
const logger_1 = require("./logger");
const renderer_1 = require("./renderer/renderer");
const deepMerge_1 = require("./utils/deepMerge");
exports.settings = {
    type: {
        typeAliases: {
            Int32: "number",
        },
        generatedTypes: "interface",
        membersOptional: true,
        templateFile: path.join(__dirname, "..", "..", "templates", "typeDefinitions.handlebars"),
        outPutPath: path.join(process.cwd(), "serverTypes", "serverTypes.ts"),
    },
    operations: {
        operationsGroupNameTransformFn,
        operationsNameTransformFn,
        ungroupedOperationsName: "AllOperations",
        templateFile: path.join(__dirname, "..", "..", "templates", "operationsGroup.handlebars"),
        outPutPath: path.join(process.cwd(), "serverTypes", "httpClients"),
        outFileNameTransformFn: operationsGroupFilenameFn,
    },
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
    deepMerge_1.deepMerge(exports.settings, settingsFromFile, override);
    // overrides
    if (override.swaggerFile && exports.settings.swaggerProvider) {
        exports.settings.swaggerProvider = null;
    }
    if (override.swaggerProvider && exports.settings.swaggerFile) {
        exports.settings.swaggerFile = null;
    }
    renderer_1.registerHandleBarsHelpers(exports.settings);
    return exports.settings;
}
exports.loadSettings = loadSettings;
