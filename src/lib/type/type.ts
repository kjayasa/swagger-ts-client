import {IProperty, ISwaggerDefinition, IType} from "./typeBuilder";
import {TypeNameInfo} from "./typeNameInfo";
import {Schema} from "swagger-schema-official";

export class Type  implements IType{

    public properties: IProperty[] = [];
    public typeNameInfo: TypeNameInfo;
    public interfaces: string[] = [];
    public extendsClause: string = "";
    public discriminator?: string;

    constructor(public swaggerTypeName: string, swaggerType: Schema){
        this.typeNameInfo = TypeNameInfo.fromSwaggerTypeName(swaggerTypeName);
        this.discriminator = swaggerType.discriminator;
    }

    get typeName(): string {
        return this.typeNameInfo.typeName;
    }

    get isGeneric(): boolean{
        return this.typeNameInfo.isGeneric;
    }

    private get partialTypeName(): string {
        return this.typeNameInfo.partialTypeName;
    }

    public addProperty(propertyName: string, propertyType: TypeNameInfo, required: boolean, enumValue?: Array<string | boolean | number | {}>) {
        if (this.isGeneric){
            propertyType = this.typeNameInfo.replaceWithGenericType(propertyType);
        }
        this.properties.push(
            {
                propertyName,
                typeName: propertyType.fullTypeName,
                required: required ? "" : "?",
                enumValue,
            },
        );
    }

    public addInterface(interfaceName: string) {
        this.interfaces.push(interfaceName);
        this.extendsClause = `extends ${this.interfaces.join(",")}`;
    }
}
