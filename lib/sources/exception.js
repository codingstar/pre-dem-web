"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var source_1 = require("../source");
var TraceKit = require("tracekit");
exports.default = function () {
    return new source_1.default('exception', function (action) {
        TraceKit.report.subscribe(function (errorMsg) {
            action({
                type: 'error',
                category: 'error',
                payload: errorMsg
            });
        });
    });
};
//# sourceMappingURL=exception.js.map