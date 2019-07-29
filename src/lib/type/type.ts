import {IProperty, ISwaggerDefinition, IType} from "./typeBuilder";
import {TypeNameInfo} from "./typeNameInfo";

export class Type  implements IType{

    public properties: IProperty[] = [];
    public typeNameInfo: TypeNameInfo;

    constructor(public swaggerTypeName: string){
        this.typeNameInfo = TypeNameInfo.fromSwaggerTypeName(swaggerTypeName);
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
}
