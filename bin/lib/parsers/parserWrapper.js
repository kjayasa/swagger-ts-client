"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ParserWrapper {
    constructor(parseFn) {
        this.parseFn = parseFn;
    }
    parse(input, options = undefined) {
        return this.parseFn(input, options);
    }
}
exports.ParserWrapper = ParserWrapper;
