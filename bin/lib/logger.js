"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Logger {
    info(message) {
        console.info(message);
    }
    error(error) {
        console.error("\x1b[31m%s\x1b[0m", error.message);
        console.error("\x1b[2m\x1b[31m%s\x1b[0m", error.stack);
    }
}
exports.logger = new Logger();
