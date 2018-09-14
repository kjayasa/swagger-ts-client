import * as Swagger from "swagger-schema-official";
import { ITypeNameParserAst, typeNameParser } from "../parsers/parsers";
import { settings } from "../settings";

const typeRefRegx = /#(?:\/[^\/]+)+\/([^\/]+)/;

type ReplacerFn = (substring: string, ...args: any[]) => string;

function replaceAll(str: string, searchStr, replacement: ReplacerFn | string) {
  const searchRegx =
    new RegExp(searchStr.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), "g");

  return str.replace(searchRegx, replacement as any);
}

function getTypeAliases(): Array<{ alias: string, typeDefinition: string }> {
  if (settings.type.typeAliases) {
    return Object.keys(settings.type.typeAliases).map((alias) => {
      return {
        alias,
        typeDefinition: settings.type.typeAliases[alias] as string,
      };
    });
  }

}
export class TypeNameInfo {
  //private parsedResult:ITypeNameParserAst=null;
  public isInlineType: boolean = false;
  public isOptional: boolean = false;
  private genericTypeArgsMap: Map<ITypeNameParserAst, ITypeNameParserAst> = null;

  private static inlineSchemaCount = 1;
  private static genericTypeNames = "TUKABCDEFGHIJLMNOPQRSVWXYZ".split("");
  private static primitiveSwaggerTypes: string[] = [
    "integer", "number", "string", "boolean"];
  private static primitiveJsTypes: string[] = [
    "number", "string", "String", "boolean",
    "Date", "any", "void", "Array", "Map", "Set"];

  private static primitiveTypesMapping = {
    "integer+int32": "number",
    "integer+int64": "number",
    "number+double": "number",
    "number+float": "number",
    "number": "number",
    "integer": "number",
    "string": "string",
    "string+byte": "string",
    "string+binary": "string",
    "boolean": "boolean",
    "string+date": "Date",
    "string+date-time": "Date",
    "string+password": "string",
  };

  get typeName(): string {
    if (this.isGeneric) {
      return `${this.parsedResult.partialTypeName}` +
       `<${
          [...this.genericTypeArgsMap.values()]
            .map((i) => i.fullTypeName).join()
        }>`;
    }
    else {
      return this.parsedResult.partialTypeName;
    }
  }

  get fullTypeName(): string {
    return this.parsedResult.fullTypeName;
  }

  get isGeneric(): boolean {
    return this.parsedResult.genericParams &&
      this.parsedResult.genericParams.length > 0;
  }

  get partialTypeName() {
    return this.parsedResult.partialTypeName;
  }

  constructor(private parsedResult: ITypeNameParserAst) {
    this.substituteAliases();

    if (this.isGeneric) {
      this.genericTypeArgsMap = new Map(
        this.parsedResult.genericParams
          .map((ta, i) => {
            const ast = typeNameParser.parse(TypeNameInfo.genericTypeNames[i]);
            return [ta, ast] as [ITypeNameParserAst, ITypeNameParserAst];
          })
      );
    }
  }

  public replaceWithGenericType(propertyTypeName: TypeNameInfo): TypeNameInfo {
    for (const [typeArg, genericTypeName] of this.genericTypeArgsMap) {
      propertyTypeName =
        TypeNameInfo.substitute(propertyTypeName, typeArg, genericTypeName);
    }

    return propertyTypeName;
  }

  public getComposingTypeNames(filterPrimitive: boolean = false): string[] {
    if (filterPrimitive) {
      return this.parsedResult.composingTypes
        .filter((ct) => !TypeNameInfo.isJsPrimitive(ct.partialTypeName))
        .map((ct) => ct.partialTypeName);
    }
    else {
      return this.parsedResult.composingTypes.map((ct) => ct.partialTypeName);
    }
  }

  public static fromSwaggerTypeName(swaggerTypeName: string): TypeNameInfo {
    return new TypeNameInfo(typeNameParser.parse(swaggerTypeName));
  }

  public static createInlineTypeName(): TypeNameInfo {
    const ret = new TypeNameInfo(
      typeNameParser.parse(`SwaggerInlineType${this.inlineSchemaCount++}`));

    ret.isInlineType = true;
    return ret;
  }

  public static isSwaggerTypePrimitive(swaggerTypeName: string): boolean {
    return this.primitiveSwaggerTypes.includes(swaggerTypeName);
  }

  public static getPrimitiveType(schema: Swagger.Schema): string {
    let type = "";
    if (schema.format) {
      type = this.primitiveTypesMapping[`${schema.type}+${schema.format}`];

      if (!type) {
        type = this.primitiveTypesMapping[schema.type];
      }
    } else {
      type = this.primitiveTypesMapping[schema.type];
    }

    if (!type) {
      throw new Error(
        `unsupported schema {type: ${schema.type}, format:${schema.format}}`);
    }
    return type;

  }

  public static isJsPrimitive(typename: string) {
    return this.primitiveJsTypes.includes(typename);
  }

  public static getTypeNameInfoFromSchema(schema: Swagger.Schema): TypeNameInfo {
    let typenameInfo: TypeNameInfo;

    if (schema.$ref && schema.$ref[0] === "#") {
      const match = schema.$ref.match(typeRefRegx);

      if (match) {
        typenameInfo = TypeNameInfo.fromSwaggerTypeName(match[1]);
      }
    }
    else if (this.isSwaggerTypePrimitive(schema.type)) {
      typenameInfo = TypeNameInfo.fromSwaggerTypeName(
        this.getPrimitiveType(schema));
    }
    else if (schema.type === "array" && schema.items) {
      const itemSchema = (schema.items instanceof Array)
                          ? schema.items[0]
                          : schema.items;

      typenameInfo = TypeNameInfo.fromSwaggerTypeName(
        `Array<${this.getTypeNameInfoFromSchema(itemSchema).fullTypeName}>`);
    }
    else if (schema.type === "object" && schema.properties) {
      typenameInfo = TypeNameInfo.createInlineTypeName();
    }
    else {
      typenameInfo = TypeNameInfo.fromSwaggerTypeName("any");
    }

    if (typeof schema.required !== 'undefined' &&
        typeof schema.required === 'boolean')
    {
      typenameInfo.isOptional = !schema.required;
    }

    return typenameInfo;
  }

  private static substitute(
    typeName: TypeNameInfo,
    searchTypeAst: ITypeNameParserAst,
    replacementAst: ITypeNameParserAst): TypeNameInfo
  {
    typeName.parsedResult.composingTypes.forEach((ct) => {
      if (ct.fullTypeName === searchTypeAst.fullTypeName) {
        ct.partialTypeName = replacementAst.partialTypeName;
        ct.genericParams = replacementAst.genericParams;
      }
    });

    return typeName;
  }

  private static substituteWithAlias(
    alias: string,
    typedef: string,
    typeName: ITypeNameParserAst)
  {
    const aliasAst = typeNameParser.parse(alias);

    if (aliasAst.partialTypeName === typeName.partialTypeName) {
      if (aliasAst.genericParams && aliasAst.genericParams.length) {
        const typeDefAst = typeNameParser.parse(typedef);
        aliasAst.genericParams.forEach((agp) => {});

      } else {
        typeName.partialTypeName = typedef;
      }
    }
  }

  private substituteAliases() {
    if (settings.type.typeAliases) {
      getTypeAliases().forEach((alias) => {
        this.parsedResult.composingTypes
          .forEach((ct) => {
            return TypeNameInfo.substituteWithAlias(
              alias.alias, alias.typeDefinition, ct);
          });
      });
    }
  }
}
