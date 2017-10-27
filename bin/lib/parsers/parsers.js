"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parserWrapper_1 = require("./parserWrapper");
const lambdaParserGen = require("./lambdaParser/parser.generated");
const typeNameParserGen = require("./typeNameParser/parser.generated");
exports.lambdaParser = new parserWrapper_1.ParserWrapper(lambdaParserGen.parse);
exports.typeNameParser = new parserWrapper_1.ParserWrapper(typeNameParserGen.parse);
