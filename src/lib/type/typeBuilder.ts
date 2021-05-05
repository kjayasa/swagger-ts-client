import * as changeCase from "change-case";
import * as Swagger from "swagger-schema-official";
import {logger} from "../logger";
import {IOperationsGroup} from "../operation/operationsBuilder";
import {Type} from "./type";
import {TypeNameInfo} from "./typeNameInfo";

function isBodyParam(param: Swagger.Parameter | Swagger.BodyParameter): param is Swagger.BodyParameter {
    return (param as Swagger.BodyParameter).schema ? true : false;
}

export interface IType{
    readonly typeName: string;
    readonly swaggerTypeName: string;
    readonly properties?: IProperty[];
    readonly interfaces?: string[];
    readonly extendsClause: string;
    readonly discriminator?: string;
}
export interface IProperty{
    propertyName: string;
    typeName: string;
    required: string;
    enumValue?: Array<string | boolean | number | {}>;
}

export interface ISwaggerDefinition{
    [definitionsName: string]: Swagger.Schema;
}

export class TypeBuilder{
    private typeCache: Map<string, IType> = new Map();
    private inlineTypes: Map<string, Swagger.Schema> = new Map();
    constructor(private definition: ISwaggerDefinition){
      this.buildTypeCache();
    }

    public getTypeName(swaggerTypeName: string){
        return TypeNameInfo.fromSwaggerTypeName(swaggerTypeName).typeName;
    }

    public getTypeNameInfo(schema: Swagger.BaseSchema): TypeNameInfo{
        return TypeNameInfo.getTypeNameInfoFromSchema(schema);
    }
    public getTypeNameInfoParameter(param: Swagger.Parameter){
        const schema = isBodyParam(param) ? (param as Swagger.BodyParameter).schema : param;
        return this.getTypeNameInfo(schema);

    }

    public getAllTypes(): IType[] {
        return [...this.typeCache.values()];
    }

    public findType(name: string): IType | undefined {
        return this.getAllTypes()
            .find((t) => t.swaggerTypeName === name);
    }

    public findProp(type: IType, propName: string): IProperty | undefined {
        return type.properties.find((p) => p.propertyName === propName);
    }
    private buildTypeCache(){
        logger.info("Building Types..");
        Object.keys(this.definition).forEach((swaggerTypeName) => {
            const typename = this.getTypeName(swaggerTypeName);
            if (!this.typeCache.has(typename)){
                const type = this.buildTypeFromDefinetion(swaggerTypeName);
                this.typeCache.set(typename, type);
            }
        });

        this.inlineTypes.forEach((schema, swaggerTypeName) => {
            this.typeCache.set(swaggerTypeName, this.buildType(swaggerTypeName, schema));
        });

        // post-process to add derived props
        this.typeCache.forEach((type, name) => {
            if (type.interfaces) {
                type.interfaces.forEach(intf => {
                    const it = this.typeCache.get(intf);
                    if (!it) {
                        throw "interface not found in cache " + intf;
                    }
                    if (it.properties) {
                        it.properties.forEach(prop => {
                            type.properties.push(prop);
                        })
                    }
                })
            }
        });
    }
    private  buildTypeFromDefinetion(swaggerTypeName: string): IType {

        const swaggerType = this.definition[swaggerTypeName];
        return this.buildType(swaggerTypeName, swaggerType);

    }
    private  buildType(swaggerTypeName: string, swaggerType: Swagger.Schema): IType {
       // let fullTypeName=this.splitGeneric(swaggerTypeName);
        const type = new Type(swaggerTypeName, swaggerType);

        this.collectProperties(type, swaggerType);
        this.collectInterfaces(swaggerType).forEach((i) =>
            type.addInterface(i),
        );
        return type;
    }

    private collectProperties(type: Type, swaggerType: Swagger.Schema) {
        if (swaggerType.properties) {
            const required = swaggerType.required || [];
            const properties = swaggerType.properties;
            for (const propertyName in properties) {
                if (properties.hasOwnProperty(propertyName)) {
                    const prop = properties[propertyName];
                    let typeName = TypeNameInfo.getTypeNameInfoFromSchema(prop);
                    if (typeName.isInlineType){
                        typeName = TypeNameInfo.fromSwaggerTypeName(type.typeNameInfo.partialTypeName + changeCase.pascalCase(propertyName));
                        this.inlineTypes.set(typeName.fullTypeName, prop);
                    }
                    type.addProperty(propertyName, typeName, required.indexOf(propertyName) != -1, prop.enum);
                }
            }
            return;
        } else if (swaggerType.allOf) {
            swaggerType.allOf.forEach((st) =>
                this.collectProperties(type, st)
            );
        }
    }

    private collectInterfaces(swaggerType: Swagger.Schema): string[] {
        if (swaggerType.$ref) {
            return [ swaggerType.$ref.substring("#/definitions/".length) ];
        }
        if (swaggerType.allOf) {
            let res = [];
            swaggerType.allOf.forEach((s) =>
                res = res.concat(this.collectInterfaces(s)),
            );
            return res;
        }
        return [];
    }
}
