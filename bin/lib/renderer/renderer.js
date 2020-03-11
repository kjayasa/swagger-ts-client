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
const handlebars = require("handlebars");
const fsUtil_1 = require("../utils/fsUtil");
const helpers_1 = require("./helpers");
handlebars.registerHelper("joinList", helpers_1.joinListHelper);
handlebars.registerHelper("filterList", helpers_1.filterListHelper);
handlebars.registerHelper("some", helpers_1.someHelper);
handlebars.registerHelper("changeCase", helpers_1.changeCaseHelper);
function registerHandleBarsHelpers(settings) {
    if (settings.templateHelpers) {
        handlebars.registerHelper(settings.templateHelpers);
    }
}
exports.registerHandleBarsHelpers = registerHandleBarsHelpers;
class AbstractRenderer {
    constructor(options, renderHelpers) {
        if (!options || !(options.template || options.templatePath)) {
            throw new Error("Template or Template path is needed");
        }
        if (options.template) {
            this.template = options.template;
        }
        else {
            this.templatePath = options.templatePath;
        }
    }
    render(stream, obj) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.compliedTemplate) {
                yield this.compileTemplate();
            }
            try {
                const compiled = this.compliedTemplate(this.getRenderContext(obj));
                stream.write(compiled);
            }
            catch (e) {
                throw new Error(`Error compiling ${stream.path} : obj "${obj} \n ${e}`);
            }
        });
    }
    loadTemplate() {
        return __awaiter(this, void 0, void 0, function* () {
            return fsUtil_1.readFile(this.templatePath, "utf8");
        });
    }
    compileTemplate() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.template) {
                try {
                    this.template = yield this.loadTemplate();
                }
                catch (error) {
                    throw error;
                }
            }
            return new Promise((resolve) => {
                this.compliedTemplate = handlebars.compile(this.template, { noEscape: true });
                resolve(this.compliedTemplate);
            });
        });
    }
}
exports.AbstractRenderer = AbstractRenderer;
