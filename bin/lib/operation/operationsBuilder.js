"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../logger");
const operation_1 = require("./operation");
const httpVerbs = ["get", "put", "post", "delete", "options", "head", "patch"];
class OperationsGroup {
    constructor(operationsGroupName) {
        this.operationsGroupName = operationsGroupName;
        this.operations = [];
        this.importedTypes = [];
    }
    addImportedTypes(typenames) {
        typenames.forEach((tn) => {
            if (!this.importedTypes.includes(tn)) {
                this.importedTypes.push(tn);
            }
        });
    }
}
class OperationsBuilder {
    constructor(paths, typeManager) {
        this.paths = paths;
        this.typeManager = typeManager;
        this.opsGroups = new Map();
        this.buildGroups();
    }
    buildGroups() {
        logger_1.logger.info("Building Groups...");
        for (const url in this.paths) {
            const swPath = this.paths[url];
            httpVerbs.forEach((verb) => {
                const opr = swPath[verb];
                if (opr) {
                    const operation = new operation_1.Operation(verb, url, opr, this.typeManager);
                    const group = this.getGroup(operation.groupName);
                    group.operations.push(operation);
                    group.addImportedTypes(operation.importedTypes);
                }
            });
        }
    }
    getAllGroups() {
        return [...this.opsGroups.values()];
    }
    getGroup(groupName) {
        if (this.opsGroups.has(groupName)) {
            return this.opsGroups.get(groupName);
        }
        else {
            const group = new OperationsGroup(groupName);
            this.opsGroups.set(groupName, group);
            return group;
        }
    }
}
exports.OperationsBuilder = OperationsBuilder;
