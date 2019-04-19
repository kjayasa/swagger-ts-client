"use strict";
/*based of https://github.com/jonschlinkert/mixin-deep
 */
Object.defineProperty(exports, "__esModule", { value: true });
function deepMerge(target, ...objects) {
    let len = arguments.length, i = 0;
    while (++i < len) {
        const obj = arguments[i];
        if (isObject(obj)) {
            for (const key in obj) {
                if (copy.call(target, obj[key], key, obj) === false) {
                    break;
                }
            }
        }
    }
    return target;
}
exports.deepMerge = deepMerge;
function copy(val, key) {
    const obj = this[key];
    if (isObject(val) && isObject(obj) && typeof val !== "function") { // do not extend functions, Copy it.
        deepMerge(obj, val);
    }
    else {
        this[key] = val;
    }
}
function isObject(val) {
    return isExtendable(val) && !Array.isArray(val);
}
function isExtendable(val) {
    return typeof val !== "undefined" && val !== null &&
        (typeof val === "object" || typeof val === "function");
}
