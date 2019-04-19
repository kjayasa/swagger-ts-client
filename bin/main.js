#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
var lib_1 = require("./lib");
exports.TsFromSwagger = lib_1.TsFromSwagger;
exports.HttpSwaggerProvider = lib_1.HttpSwaggerProvider;
const cli_1 = require("./cli");
const lib_2 = require("./lib");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const args = cli_1.getArgs();
        const app = new lib_2.TsFromSwagger(args.configFile, args.settings);
        yield app.generateCode();
    });
}
main()
    .then(() => {
    console.info("done");
}).catch((error) => {
    lib_2.logger.error(error);
});
