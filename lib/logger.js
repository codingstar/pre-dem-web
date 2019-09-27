"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var levels = ['log', 'info', 'warn', 'error'];
var originalLevels = {};
levels.forEach(function (level) { return originalLevels[level] = console[level]; });
var levelColors = {
    qiniu: '#29a8e1',
    normal: '#333',
    log: '#86C166',
    info: '#006284',
    warn: '#CA7A2C',
    error: '#CB1B45' // KURUNAI
};
var logger = {};
levels.forEach(function (level) { return logger[level] = function (message) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    if (typeof message !== 'string' || args.length > 0) {
        return originalLevels[level].apply(console, [message].concat(args));
    }
    return originalLevels[level].call(console, "%c[DEM-DEBUG] %c[" + level.toUpperCase() + "] %c" + message, "color: " + levelColors.qiniu, "color: " + levelColors[level], "color: " + levelColors.normal);
}; });
exports.default = logger;
// TODO: Logger could be a devtools 
//# sourceMappingURL=logger.js.map