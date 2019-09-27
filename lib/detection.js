"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
exports._window = !utils_1.isUndefined(window) ? window
    : !utils_1.isUndefined(global) ? global
        : !utils_1.isUndefined(self) ? self
            : {};
exports._document = exports._window['document'];
exports._navigator = exports._window['navigator'];
exports.hasJSON = !!(utils_1.isObject(JSON) && !utils_1.isNil(JSON.stringify));
exports.hasDocument = !utils_1.isUndefined(exports._document);
exports.hasNavigator = !utils_1.isUndefined(exports._navigator);
//# sourceMappingURL=detection.js.map