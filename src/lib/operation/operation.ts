import * as Swagger from "swagger-schema-official";
import {HttpVerb, settings} from "../settings";
import {TypeBuilder} from "../type/typeBuilder";
import { TypeNameInfo } from "../type/typeNameInfo";
import {IOperation, IOperationParam} from "./operationsBuilder";

const nonLitralRegx = /[^_$a-zA-Z0-9\xA0-\uFFFF]/g;
export class Operation implements IOperation {
    public operationParams: IOperationParam[];
    public responsesType: string;
    public operationName: string;
    public groupName: string;
    public importedTypes: string[] = [];

    constructor( public httpVerb: string , public url: string, private swOpr: Swagger.Operation , private typeManager: TypeBuilder ) {
       this.operationName = settings.operations.operationsNameTransformFn(url, httpVerb as HttpVerb, swOpr);
       this.groupName = settings.operations.operationsGroupNameTransformFn(url, httpVerb as HttpVerb, swOpr);
       this.build();
    }
    public build(){
        this.responsesType = this.getResponse();
        if (this.swOpr.parameters && this.swOpr.parameters.length){
            this.operationParams = this.swOpr.parameters.map((p) => this.buildParam(p));
        }

    }
    public getResponse(): string{
        if (this.swOpr.responses && this.swOpr.responses["200"] && this.swOpr.responses["200"].schema){
            const retType = this.typeManager.getTypeNameInfo(this.swOpr.responses["200"].schema);

            if (!TypeNameInfo.isJsPrimitive(retType.fullTypeName)){
                this.addImportedType(retType);
            }
            return retType.fullTypeName;
        }
        else{
            return "void";
        }
    }
    public buildParam(param: Swagger.Parameter): IOperationParam {
        const paramType = this.typeManager.getTypeNameInfoParameter(param);
        this.addImportedType(paramType);

        return {
            paramName: param.name,
            paramDisplayName: param.name.replace(nonLitralRegx, "_"),
            paramType: paramType.fullTypeName,
            inBody: param.in === "body",
            inPath: param.in === "path",
            inQuery: param.in === "query",
        } as IOperationParam;
    }

    private addImportedType(typename: TypeNameInfo){
        this.importedTypes = this.importedTypes.concat(typename.getComposingTypeNames(true));
    }
}
