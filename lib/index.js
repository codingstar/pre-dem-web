"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dem_1 = require("./dem");
var transfer_1 = require("./transfer");
var web_data_1 = require("./web-data");
var transaction_1 = require("./transaction");
var APP_KEY_LENGTH = 24;
var APP_ID_LENGTH = 8;
var Predem = (function () {
    function Predem() {
    }
    Predem.prototype.init = function (options) {
        var appKey = options.appKey, domain = options.domain, httpEnabled = options.httpEnabled, crashEnabled = options.crashEnabled, performanceEnabled = options.performanceEnabled, bufferCapacity = options.bufferCapacity;
        if (!appKey || appKey.length !== APP_KEY_LENGTH) {
            console.error("appKey is invalid");
            return;
        }
        if (!domain) {
            console.error("domain is not defined");
            return;
        }
        dem_1.default.messages.apiDomain = domain;
        if (Number.isInteger(bufferCapacity)) {
            dem_1.default.messages.messageThreshold = bufferCapacity;
        }
        var appId = appKey.substring(0, APP_ID_LENGTH);
        web_data_1.default.init(appId, domain, "" + !!httpEnabled, "" + !!crashEnabled, "" + !!performanceEnabled);
        this.initTransfer();
    };
    Predem.prototype.setTag = function (tag) {
        web_data_1.default.setTag(tag);
    };
    Predem.prototype.setAppVersion = function (version) {
        web_data_1.default.setVersion(version);
    };
    Predem.prototype.setPerformanceFilter = function (filterFunc) {
        if (!filterFunc) {
            console.error("filter 不能为空！");
            return;
        }
        if (!(filterFunc instanceof Function)) {
            console.error("filter 必须是 Function！");
            return;
        }
        web_data_1.default.setPerformanceFilter(filterFunc);
    };
    Predem.prototype.captureException = function (err) {
        dem_1.default.captureException(err);
    };
    Predem.prototype.sendEvents = function (events) {
        if (!(events instanceof Array)) {
            console.log("Custom data need type Array");
            return;
        }
        if (events.length === 0) {
            console.error("Custom data can not be empty");
            return;
        }
        var event = events[0];
        if (event.eventName === "undefine" || event.eventData === "undefine") {
            console.error("Custom data must have eventName and eventData");
            return;
        }
        return web_data_1.default.sendEventData(events);
    };
    Predem.prototype.sendEvent = function (event) {
        if (!event) {
            return;
        }
        this.sendEvents([event]);
    };
    Predem.prototype.transactionStart = function (name) {
        return new transaction_1.default(name);
    };
    Predem.prototype.initTransfer = function () {
        var testTransfer = new transfer_1.default(web_data_1.default.tag, function (datas, callback) {
            web_data_1.default.push(datas);
            callback();
        });
        dem_1.default.addTransfer(testTransfer);
    };
    return Predem;
}());
exports.Predem = Predem;
var predem = new Predem();
exports.default = predem;
//# sourceMappingURL=index.js.map