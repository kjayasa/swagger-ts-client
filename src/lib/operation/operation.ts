import * as Swagger from "swagger-schema-official";
import { HttpVerb, settings } from "../settings";
import { TypeBuilder } from "../type/typeBuilder";
import { TypeNameInfo } from "../type/typeNameInfo";
import { IOperation, IOperationParam } from "./operationsBuilder";

const nonLitralRegx = /[^_$a-zA-Z0-9\xA0-\uFFFF]/g;

export class Operation implements IOperation {
  public operationParams: IOperationParam[];
  public responsesType: string;
  public operationName: string;
  public groupName: string;
  public importedTypes: string[] = [];

  constructor(
    public httpVerb: HttpVerb,
    public url: string,
    private swOpr: Swagger.Operation,
    private typeManager: TypeBuilder)
  {
    this.operationName = settings.operations
      .operationsNameTransformFn(url, httpVerb, swOpr);

    this.groupName = settings.operations
      .operationsGroupNameTransformFn(url, httpVerb, swOpr);

    this.build();
  }

  public build() {
    this.responsesType = this.getResponse();

    if (this.swOpr.parameters && this.swOpr.parameters.length) {
      this.operationParams = this.swOpr.parameters
        .map((p) => this.buildParam(p));
    }
  }

  public getResponse(): string {
    const resps = this.swOpr.responses;

    if (resps) {
      for (const rt of Object.keys(resps)) {
        const nrt = (parseInt(rt, 10) / 100.0) as number;

        if (Math.round(nrt) === 2) {
          const schema = resps[rt].schema;

          if (schema) {
            const retType = this.typeManager.getTypeNameInfo(schema);

            if (!TypeNameInfo.isJsPrimitive(retType.fullTypeName)) {
              this.addImportedType(retType);
            }

            return retType.fullTypeName;
          }
        }
      }
    }

    return "void";
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
      optional: paramType.isOptional,
    } as IOperationParam;
  }

  private addImportedType(typename: TypeNameInfo) {
    this.importedTypes =
      this.importedTypes.concat(typename.getComposingTypeNames(true));
  }
}
