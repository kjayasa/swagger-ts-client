import * as Swagger from "swagger-schema-official";
import {settings} from "../settings";
import {IType} from "../type/typeBuilder";
import {AbstractRenderer} from "./renderer";

interface ISwaggerDefinition{
    [definitionsName: string]: Swagger.Schema;
}

export class TypesDefinitionRender extends AbstractRenderer<IType[]>{
    constructor(){
        super({templatePath: settings.type.templateFile});
    }
    public gettypeAliasis(): Array<{alias: string, typeDefinition: string}>{
       return Object.keys(settings.type.typeAliasis).map((alias) => {
            return {
                alias,
                typeDefinition: settings.type.typeAliasis[alias] as string,
            };
        });
    }
    protected getRenderContext(types: IType[]): {} {
        const declaredTypes = {
            typeAliasis: this.gettypeAliasis(),
            generatedTypes: settings.type.generatedTypes,
            membersOptional: settings.type.membersOptional ? "?" : "",
            types,
            tag: settings.type.templateTag,
        };
        return declaredTypes;
    }

}
