"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var store_1 = require("./store");
var logger_1 = require("./logger");
var web_data_1 = require("./web-data");
var utils_1 = require("./utils");
var breadcrumbCategories = ['console', 'history', 'ui.events', 'network'];
var isBreadcrumb = function (category) {
    return breadcrumbCategories.indexOf(category) >= 0;
};
var MessagesStore = (function () {
    function MessagesStore(parent) {
        this.counter = 0;
        this.store = new store_1.CollectionStore('messages');
        this.messageThreshold = 5;
        this.apiDomain = "";
        this.maxTime = 5 * 60 * 1000;
        this.parent = parent;
    }
    MessagesStore.prototype.add = function (data) {
        var _this = this;
        // 判断是否 add 数据
        var appConfig = web_data_1.default.getSendDataConfig();
        if (appConfig !== null) {
            if (data.category === "performance" && !appConfig.webPerfEnabled) {
                return;
            }
            else if (data.category === "error" && !appConfig.crashEnabled) {
                return;
            }
            else if (data.category === "network" && !appConfig.ajaxEnabled) {
                return;
            }
        }
        var message = {
            id: ++this.counter,
            data: data,
            sent: false
        };
        // 过滤 数据上报的请求
        if (message.data.category === 'network' && this.apiDomain != "") {
            if (message.data.payload.url.indexOf(this.apiDomain) !== -1) {
                return;
            }
        }
        if (utils_1.localStorageIsSupported) {
            if (message.data.category === 'network' && this.messageThreshold > 1) {
                // 合并发送
                var networkMessageArray_1 = [];
                if (window.localStorage["networkMessageArray"] === undefined) {
                    window.localStorage.setItem("networkMessageArray", "[]");
                }
                networkMessageArray_1 = JSON.parse(window.localStorage["networkMessageArray"]);
                networkMessageArray_1.push(message);
                var subTime = new Date().getTime() - networkMessageArray_1[0].timestamp;
                if (networkMessageArray_1.length >= this.messageThreshold || subTime >= this.maxTime) {
                    networkMessageArray_1.map(function (message) {
                        _this.store.push(message);
                    });
                    this.parent.transfers.forEach(function (transfer) { return transfer.sendArray(networkMessageArray_1); });
                    window.localStorage.setItem("networkMessageArray", "[]");
                }
                else {
                    try {
                        window.localStorage.setItem("networkMessageArray", JSON.stringify(networkMessageArray_1));
                    }
                    catch (e) {
                        this.store.push(message);
                        this.parent.transfers.forEach(function (transfer) { return transfer.sendArray(networkMessageArray_1); });
                        window.localStorage.setItem("networkMessageArray", "[]");
                    }
                }
            }
            else if (message.data.category === 'console' && this.messageThreshold > 1) {
                // 合并发送
                var consoleMessageArray_1 = [];
                if (window.localStorage["consoleMessageArray"] === undefined) {
                    window.localStorage.setItem("consoleMessageArray", "[]");
                }
                consoleMessageArray_1 = JSON.parse(window.localStorage["consoleMessageArray"]);
                consoleMessageArray_1.push(message);
                var subTime = new Date().getTime() - consoleMessageArray_1[0].timestamp;
                if (consoleMessageArray_1.length >= this.messageThreshold || subTime >= this.maxTime) {
                    consoleMessageArray_1.map(function (message) {
                        _this.store.push(message);
                    });
                    this.parent.transfers.forEach(function (transfer) { return transfer.sendArray(consoleMessageArray_1); });
                    window.localStorage.setItem("consoleMessageArray", "[]");
                }
                else {
                    try {
                        window.localStorage.setItem("consoleMessageArray", JSON.stringify(consoleMessageArray_1));
                    }
                    catch (e) {
                        this.store.push(message);
                        this.parent.transfers.forEach(function (transfer) { return transfer.sendArray(consoleMessageArray_1); });
                        window.localStorage.setItem("consoleMessageArray", "[]");
                    }
                }
            }
            else {
                this.store.push(message);
                this.parent.transfers.forEach(function (transfer) { return transfer.sendArray([message]); });
            }
        }
        else {
            this.store.push(message);
            this.parent.transfers.forEach(function (transfer) { return transfer.sendArray([message]); });
        }
        if (isBreadcrumb(data.category)) {
            this.parent.getCallback('breadcrumb')(data);
        }
        if (data.category === 'error') {
            this.parent.getCallback('exception')(data);
        }
        if (this.parent.debug) {
            logger_1.default.log("[MESSAGES] New message added [" + data.category + "], messages count: " + this.store.length);
            logger_1.default.log("[MESSAGES]", data);
        }
    };
    return MessagesStore;
}());
exports.MessagesStore = MessagesStore;
//# sourceMappingURL=messages-store.js.map