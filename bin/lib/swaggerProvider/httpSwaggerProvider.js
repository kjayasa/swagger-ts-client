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
const request = require("request-promise-native");
class HttpSwaggerProvider {
    constructor(url, userName = "", password = "") {
        this.url = url;
        this.userName = userName;
        this.password = password;
        if (!url) {
            throw new Error("Url to fetch swagger definition is not provided");
        }
    }
    provide(settings, logger) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = null;
            if (this.userName && this.password) {
                logger.info(`Requesting swagger definitions from ${this.url} ...`);
                response = yield request.get(this.url).auth(this.userName, this.password, false);
                logger.info(`Received swagger definitions from ${this.url} ...`);
                return JSON.parse(response);
            }
            else {
                logger.info(`Requesting swagger definitions from ${this.url} ...`);
                response = yield request.get(this.url);
                logger.info(`Received swagger definitions from ${this.url} ...`);
                return JSON.parse(response);
            }
        });
    }
}
exports.HttpSwaggerProvider = HttpSwaggerProvider;
