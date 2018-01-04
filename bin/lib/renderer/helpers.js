"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const changeCase = require("change-case");
const os = require("os");
const parsers_1 = require("../parsers/parsers");
const compiledCach = new Map();
function complieFilterfn(predicate) {
    if (predicate) {
        if (compiledCach.has(predicate)) {
            return compiledCach.get(predicate);
        }
        else {
            const parseResult = parsers_1.lambdaParser.parse(predicate);
            if (parseResult && parseResult.arguments && parseResult.body) {
                const args = [...parseResult.arguments, `return (${parseResult.body})`];
                return new Function(...args);
            }
        }
        return null;
    }
}
function filterListHelper(...args) {
    let context = args.shift(), options = args.pop(), fliter = args.shift(), take = args.shift() || -1;
    if (context && context instanceof Array && fliter) {
        /* tslint:disable:triple-equals */
        if (take == -1) {
            take = context.length;
        }
        /* tslint:enable:triple-equals */
        if (fliter) {
            const fliterFn = complieFilterfn(fliter);
            if (fliterFn) {
                let ret = "";
                for (let i = 0; i < take; i++) {
                    if (fliterFn(context[i], i, context)) {
                        ret = ret + options.fn(context[i]);
                    }
                }
                return ret;
            }
            else {
                throw new Error(`${fliter} is not valid filter expressaion`);
            }
        }
        else {
            throw new Error("parameter 'filter' in  #filterList Helper is not optional");
        }
    }
    else {
        return "";
    }
}
exports.filterListHelper = filterListHelper;
function someHelper(...args) {
    const context = args.shift(), options = args.pop(), fliter = args.shift();
    if (context && context instanceof Array && fliter) {
        if (fliter) {
            const fliterFn = complieFilterfn(fliter);
            if (fliterFn) {
                if (context.some(fliterFn)) {
                    return options.fn(context);
                }
                else {
                    return "";
                }
            }
            else {
                throw new Error(`${fliter} is not valid filter expressaion`);
            }
        }
        else {
            throw new Error("parameter 'filter' in  #sum Helper is not optional");
        }
    }
    else {
        return "";
    }
}
exports.someHelper = someHelper;
function joinListHelper(...args) {
    const context = args.shift();
    const options = args.pop();
    if (context && context instanceof Array) {
        let [seperator, filter] = [...args];
        seperator = seperator ? seperator.replace(/\\n/g, os.EOL) : ",";
        let filteredArray = context;
        if (filter) {
            const fliterFn = complieFilterfn(filter);
            if (fliterFn) {
                filteredArray = context.filter(fliterFn);
            }
            else {
                throw new Error(`${fliterFn} is not valid filter expressaion`);
            }
        }
        return filteredArray.map((c) => options.fn(c)).join(seperator);
    }
    else {
        return "";
    }
}
exports.joinListHelper = joinListHelper;
function changeCaseHelper(context, toCase, options) {
    if (context && typeof (context) === "string" && toCase && changeCase[toCase] && changeCase[toCase] instanceof Function) {
        return changeCase[toCase](context);
    }
    else {
        return "";
    }
}
exports.changeCaseHelper = changeCaseHelper;
//# sourceMappingURL=helpers.js.map