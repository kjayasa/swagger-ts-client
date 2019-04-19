"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const settings_1 = require("../settings");
const fsSwaggerProvider_1 = require("./fsSwaggerProvider");
function getProvider() {
    if (settings_1.settings.swaggerProvider && settings_1.settings.swaggerProvider.provide) {
        return settings_1.settings.swaggerProvider;
    }
    else if (settings_1.settings.swaggerFile) {
        return new fsSwaggerProvider_1.FsSwaggerProvider();
    }
    else {
        throw new Error("Provide a swagger definition source.");
    }
}
exports.getProvider = getProvider;
