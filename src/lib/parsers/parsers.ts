import { ParserWrapper } from "./parserWrapper";

import { IAst as IlambdaAst } from "./lambdaParser/IAst";
const lambdaParserGen = require("./lambdaParser/parser.generated");

import { IAst as ITypeNameParserAst } from "./typeNameParser/IAst";
const typeNameParserGen = require("./typeNameParser/parser.generated");

export const lambdaParser = new ParserWrapper<IlambdaAst>(lambdaParserGen.parse);
export const typeNameParser = new ParserWrapper<ITypeNameParserAst>(typeNameParserGen.parse);
export { ITypeNameParserAst, IlambdaAst };
