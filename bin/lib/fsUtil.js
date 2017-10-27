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
const fs = require("fs");
const mkdirp = require("mkdirp");
const path = require("path");
function wrap(func) {
    return (...args) => {
        return new Promise((resolve, reject) => {
            func(...args, (err, ret) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(ret);
                }
            });
        });
    };
}
const mkdir = wrap(mkdirp);
exports.readFile = wrap(fs.readFile);
function createWriteStream(outPath, filename = "") {
    if (filename) {
        outPath = path.join(outPath, filename);
    }
    return fs.createWriteStream(outPath);
}
exports.createWriteStream = createWriteStream;
function createIfnotExists(outPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const parsed = path.parse(outPath);
        if (parsed.ext) {
            outPath = parsed.dir;
        }
        if (!fs.existsSync(outPath)) {
            yield mkdir(outPath);
        }
    });
}
exports.createIfnotExists = createIfnotExists;
