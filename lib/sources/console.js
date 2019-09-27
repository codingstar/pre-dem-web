"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var source_1 = require("../source");
function wrapMethod(console, level, callback) {
    var originalConsoleLevel = console[level];
    var originalConsole = console;
    if (!(level in console)) {
        return;
    }
    console["_origin_" + level] = originalConsoleLevel;
    console[level] = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var tempArgs = [];
        args.map(function (arg) {
            if (arg instanceof Object) {
                tempArgs.push(JSON.stringify(arg));
            }
            else {
                tempArgs.push(arg);
            }
        });
        var msg = tempArgs.join(' ');
        var data = {
            level: level,
            logger: 'console',
            extra: {
                'arguments': args
            }
        };
        if (originalConsoleLevel) {
            Function.prototype.apply.call(originalConsoleLevel, originalConsole, args);
        }
        callback(msg, data);
    };
}
exports.wrapMethod = wrapMethod;
var levels = ['debug', 'info', 'warn', 'error', 'log'];
exports.default = function () {
    return new source_1.default('breadcrumb.console', function (action) {
        var consoleMethodCallback = function (msg, data) {
            action({
                category: 'console',
                payload: {
                    level: data.level,
                    message: msg
                }
            });
        };
        for (var _i = 0, levels_1 = levels; _i < levels_1.length; _i++) {
            var level = levels_1[_i];
            wrapMethod(console, level, consoleMethodCallback);
        }
    });
};
//# sourceMappingURL=console.js.map