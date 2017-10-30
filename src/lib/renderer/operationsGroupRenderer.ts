import * as path from "path";
import * as Swagger from "swagger-schema-official";
import {IOperation, IOperationsGroup, OperationsBuilder} from "../operation/operationsBuilder";
import {settings} from "../settings";
import {IType} from "../type/typeBuilder";
import {AbstractRenderer} from "./renderer";

interface ISwaggerDefinition{
    [definitionsName: string]: Swagger.Schema;
}

export class OperationsGroupRender extends AbstractRenderer<IOperationsGroup>{
    constructor(){
        super({templatePath: settings.operations.templateFile});
    }
    public getTypeAliases(): Array<{alias: string, typeDefinition: string}>{
       return Object.keys(settings.type.typeAliases).map((alias) => {
            return {
                alias,
                typeDefinition: settings.type.typeAliases[alias] as string,
            };
        });
    }
    protected getRenderContext(operationGroup: IOperationsGroup): {} {
        const types = operationGroup.importedTypes;

        return {
          imports : {
              types: types && types.length ? types : null,
              path: this.getExportPath(),
          } ,
          operationGroup,
          tag: settings.operations.templateTag,
        };
    }
    private getExportPath(){
        const relativePath = path.relative(settings.operations.outPutPath, settings.type.outPutPath);
        const parsed = path.parse(relativePath);
        const moduleName = parsed.name;
        const dir = (parsed.dir).replace(/\\/g, "/"); // not using path.sep because we need to use "/" regardless of OS

        return `${( dir[0] === "." ? "" : `./`)}${dir ? `${dir}/` : ""}${moduleName}`;
    }

}
