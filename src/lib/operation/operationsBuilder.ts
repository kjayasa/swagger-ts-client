import * as Swagger from "swagger-schema-official";
import {logger} from "../logger";
import {HttpVerb} from "../settings";
import {TypeBuilder} from "../type/typeBuilder";
import {Operation} from "./operation";
export interface IOperationsGroup {
    operationsGroupName: string;
    operations: IOperation[];
    importedTypes: string[];
}

export interface IOperation {
    operationName: string;
    operationParams: IOperationParam[];
    responsesType: string;
    httpVerb: string;
    url: string;
}
export interface IOperationParam {
    paramName: string;
    paramDisplayName: string;
    paramType: string;
    inBody: boolean;
    inPath: Boolean;
}

const httpVerbs: HttpVerb[] = ["get", "put", "post", "delete", "options", "head", "patch"];

class OperationsGroup implements IOperationsGroup {
    public operations: Operation[] = [];
    public importedTypes: string[] = [];
    constructor(
        public operationsGroupName: string,
    ) {

    }
    public addImportedTypes(typenames: string[]){
        typenames.forEach((tn) => {
            if (!this.importedTypes.includes(tn)){
                this.importedTypes.push(tn);
            }
        });
    }
}

export class OperationsBuilder {
    private opsGroups: Map < string, OperationsGroup > = new Map();
    constructor(
        private paths: {
            [pathName: string]: Swagger.Path,
        },
        private typeManager: TypeBuilder) {
        this.buildGroups();
    }

    public buildGroups(): void {
        logger.info("Building Groups...");
        for (const url in this.paths) {

            const swPath = this.paths[url];

            httpVerbs.forEach((verb) => {
                const opr = swPath[verb] as Swagger.Operation;
                if (opr){
                    const operation = new Operation(verb, url, opr, this.typeManager);
                    const group = this.getGroup(operation.groupName);
                    group.operations.push(operation);
                    group.addImportedTypes(operation.importedTypes);
                }
            });
        }
    }

    public getAllGroups(){
        return [...this.opsGroups.values()] as IOperationsGroup[];
    }
    private getGroup(groupName: string): OperationsGroup{
        if (this.opsGroups.has(groupName)){
           return this.opsGroups.get(groupName);
        }else{
            const group = new OperationsGroup(groupName);
            this.opsGroups.set(groupName, group);
            return group;
        }

    }

}
