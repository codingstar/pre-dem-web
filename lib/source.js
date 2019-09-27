"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var GEN_DEFAULT_SOURCE_MESSAGE = function () { return ({
    type: 'message',
    category: 'message',
    payload: {},
    timestamp: Date.now()
}); };
var Source = (function () {
    function Source(name, processorFunc) {
        this.receivers = [];
        this.name = name;
        this.processor = processorFunc;
        processorFunc(this.action.bind(this));
    }
    Source.prototype.action = function (message) {
        var mergedMessage = utils_1.merge(GEN_DEFAULT_SOURCE_MESSAGE(), message);
        this.receivers.forEach(function (receiver) { return receiver(mergedMessage); });
    };
    Source.prototype.onAction = function (callback) {
        this.receivers.push(callback);
    };
    Source.prototype.dispose = function () {
        this.receivers.forEach(function (receiver) { return receiver = null; });
        this.receivers = [];
    };
    return Source;
}());
exports.default = Source;
//# sourceMappingURL=source.js.map