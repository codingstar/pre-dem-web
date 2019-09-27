"use strict";
/**
 * Created by sunfei on 2017/9/8.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var detection_1 = require("./detection");
var reqwest = require("reqwest");
var utils_1 = require("./utils");
var packageJson = require('../package.json');
var VERSION = packageJson.version;
var WebData = (function () {
    function WebData() {
        this.appId = "";
        this.domain = "";
        this.tag = "";
        this.ajaxEnabled = true;
        this.crashEnabled = true;
        this.webPerfEnabled = true;
        this.performanceFilter = null;
        this.appVersion = "1.0.0";
        var predemUuid = "";
        if (utils_1.localStorageIsSupported()) {
            predemUuid = window.localStorage["predemUuid"];
        }
        else {
            predemUuid = utils_1.getCookier(predemUuid);
        }
        if (predemUuid !== undefined && predemUuid !== null && predemUuid.length > 0) {
            this.uuid = predemUuid;
        }
        else {
            predemUuid = utils_1.generateUUID();
            if (utils_1.localStorageIsSupported()) {
                window.localStorage["predemUuid"] = predemUuid;
            }
            else {
                utils_1.setCookier("predemUuid", predemUuid);
            }
            this.uuid = predemUuid;
        }
    }
    WebData.prototype.init = function (appId, domain, ajaxEnabled, crashEnabled, webPerfEnabled) {
        this.appId = appId;
        this.domain = domain;
        this.ajaxEnabled = this.changeStringToBoolean(ajaxEnabled);
        this.crashEnabled = this.changeStringToBoolean(crashEnabled);
        this.webPerfEnabled = this.changeStringToBoolean(webPerfEnabled);
    };
    WebData.prototype.setTag = function (tag) {
        this.tag = tag;
    };
    WebData.prototype.setVersion = function (version) {
        this.appVersion = version;
    };
    WebData.prototype.setPerformanceFilter = function (filter) {
        this.performanceFilter = filter;
    };
    WebData.prototype.getAppConfig = function () {
        var url = this.postDataUrl(this.domain, "app_config", this.appId);
        var data = this.initAppConfigData(this.tag);
        var oldAppConfig = null;
        if (utils_1.localStorageIsSupported()) {
            oldAppConfig = window.localStorage["appConfig"];
        }
        else {
            oldAppConfig = utils_1.getCookier("appConfig");
        }
        if (oldAppConfig === null || oldAppConfig === undefined) {
            // 获取 config
            this.fetchAppConfig(url, data);
        }
        else {
            var oldTimestamp = JSON.parse(oldAppConfig).time;
            var oldDateStr = utils_1.convertDateToDateStr(new Date(oldTimestamp), false, "-");
            var nowDate = new Date();
            var nowDateStr = utils_1.convertDateToDateStr(nowDate, false, "-");
            if (oldDateStr !== nowDateStr) {
                // 获取 config
                this.fetchAppConfig(url, data);
            }
        }
    };
    WebData.prototype.fetchAppConfig = function (url, data) {
        var _this = this;
        this.request(url, 'POST', 'text/plain', JSON.stringify(data))
            .then(function (response) {
            response.text().then(function (result) {
                _this.setAppConfig(JSON.parse(result));
            });
        }).catch(function (e) {
            console.log("get app config error", e);
            var storageConfig = {
                ajaxEnabled: _this.ajaxEnabled,
                crashEnabled: _this.crashEnabled,
                webPerfEnabled: _this.webPerfEnabled,
                time: new Date().getTime(),
            };
            if (utils_1.localStorageIsSupported()) {
                window.localStorage["appConfig"] = JSON.stringify(storageConfig);
            }
            else {
                utils_1.setCookier("appConfig", JSON.stringify(storageConfig));
            }
        });
    };
    WebData.prototype.setAppConfig = function (newAppConfig) {
        var http_monitor_enabled = newAppConfig.http_monitor_enabled === true ? 1 : 0;
        var crash_report_enabled = newAppConfig.crash_report_enabled === true ? 1 : 0;
        var web_performance_enabled = newAppConfig.web_performance_enabled === true ? 1 : 0;
        var storageConfig = {
            ajaxEnabled: http_monitor_enabled,
            crashEnabled: crash_report_enabled,
            webPerfEnabled: web_performance_enabled,
            time: new Date().getTime(),
        };
        if (utils_1.localStorageIsSupported()) {
            window.localStorage["appConfig"] = JSON.stringify(storageConfig);
        }
        else {
            utils_1.setCookier("appConfig", JSON.stringify(storageConfig));
        }
    };
    WebData.prototype.getSendDataConfig = function () {
        var config = {
            ajaxEnabled: this.ajaxEnabled,
            crashEnabled: this.crashEnabled,
            webPerfEnabled: this.webPerfEnabled,
        };
        var storageConfigStr = "";
        if (utils_1.localStorageIsSupported()) {
            storageConfigStr = window.localStorage["appConfig"];
        }
        else {
            storageConfigStr = utils_1.getCookier("appConfig");
        }
        if (storageConfigStr === null || storageConfigStr === "" || storageConfigStr === undefined) {
            return config;
        }
        var storageConfig = JSON.parse(storageConfigStr);
        var ajaxEnabled = 1;
        var crashEnabled = 1;
        var webPerfEnabled = 1;
        if (!storageConfig.ajaxEnabled || !this.ajaxEnabled) {
            ajaxEnabled = 0;
        }
        if (!storageConfig.crashEnabled || !this.crashEnabled) {
            crashEnabled = 0;
        }
        if (!storageConfig.webPerfEnabled || !this.webPerfEnabled) {
            webPerfEnabled = 0;
        }
        return {
            ajaxEnabled: ajaxEnabled,
            crashEnabled: crashEnabled,
            webPerfEnabled: webPerfEnabled,
        };
    };
    WebData.prototype.sendEventData = function (batchData) {
        var _this = this;
        var url = this.postDataUrl(this.domain, "event", this.appId);
        var data = "";
        batchData.map(function (event) {
            var eventData = JSON.stringify(event.eventData);
            var eventstr = _this.initCustomEvent(_this.tag, event.eventName, eventData);
            data += JSON.stringify(eventstr) + "\n";
        });
        return this.request(url, 'POST', 'text/plain', data);
    };
    WebData.prototype.push = function (datas) {
        var _this = this;
        var result = "";
        if (datas instanceof Array && datas.length > 0) {
            var type = datas[0].category;
            var url = this.postDataUrl(this.domain, type, this.appId);
            if (type === "performance") {
                result = JSON.stringify(this.initPerformance(datas[0], this.tag));
            }
            else if (type === "error") {
                result = JSON.stringify(this.initErrorData(datas[0], this.tag));
            }
            else if (type === "network") {
                datas.map(function (data) {
                    result = result + JSON.stringify(_this.initNetworkData(data, _this.tag)) + "\n";
                });
            }
            else if (type === "console") {
                datas.map(function (data) {
                    result = result + JSON.stringify(_this.initConsoleData(data, _this.tag)) + "\n";
                });
            }
            this.getRequestFun(url, type, result);
        }
    };
    WebData.prototype.request = function (url, method, ContentType, data) {
        if (detection_1._window._origin_fetch) {
            return detection_1._window._origin_fetch(url, {
                method: method,
                headers: {
                    'Content-Type': ContentType,
                },
                body: data,
            });
        }
        else {
            return reqwest({
                url: url,
                method: method,
                headers: {
                    'Content-Type': ContentType,
                },
                body: data,
            });
        }
    };
    WebData.prototype.getRequestFun = function (url, type, result) {
        this.request(url, 'POST', 'application/json', result);
    };
    WebData.prototype.postDataUrl = function (domain, category, appId) {
        switch (category) {
            case 'app_config': {
                return domain + '/v2/' + appId + '/app-config';
            }
            case 'error': {
                return domain + '/v2/' + appId + '/crashes';
            }
            case 'performance': {
                return domain + '/v2/' + appId + '/web-performances';
            }
            case 'network': {
                return domain + '/v2/' + appId + '/http-monitors';
            }
            case 'event': {
                return domain + '/v2/' + appId + '/custom-events';
            }
            case 'console': {
                return domain + '/v2/' + appId + '/log-capture';
            }
        }
        return "";
    };
    WebData.prototype.initCustomEvent = function (tag, name, content) {
        return {
            time: Date.now(),
            type: "custom",
            name: name,
            app_version: this.appVersion,
            sdk_version: VERSION,
            sdk_id: this.uuid,
            tag: tag,
            content: content,
        };
    };
    WebData.prototype.initPerformance = function (message, tag) {
        var _this = this;
        var resourceTimings = message.payload.resourceTimings;
        var timing = message.payload.timing;
        var newResourceTimings = [];
        resourceTimings.map(function (resourceTiming) {
            if (!(resourceTiming.entryType === "xmlhttprequest" && resourceTiming.name.indexOf(_this.domain) !== 0)) {
                newResourceTimings.push(resourceTiming);
            }
        });
        if (this.performanceFilter) {
            var filterResultTimings = this.performanceFilter(newResourceTimings);
            if (!(filterResultTimings && (filterResultTimings instanceof Array))) {
                console.error("Filter should return array!");
            }
            else {
                newResourceTimings = filterResultTimings;
            }
        }
        return {
            time: Date.now(),
            type: "auto_captured",
            name: "performance",
            app_version: this.appVersion,
            sdk_version: VERSION,
            sdk_id: this.uuid,
            tag: tag,
            content: JSON.stringify({
                resourceTimings: newResourceTimings,
                timing: timing
            })
        };
    };
    ;
    WebData.prototype.initNetworkData = function (message, tag) {
        var startTimestamp = message.payload.start_timestamp ? message.payload.start_timestamp : 0;
        var responseTimeStamp = message.payload.response_timestamp ? message.payload.response_timestamp : 0;
        var endTimeStamp = message.payload.end_timestamp ? message.payload.end_timestamp : 0;
        var networkErrorCode = message.payload.duration === 0 ? -1 : 0;
        var statusCode = networkErrorCode === -1 ? 0 : message.payload.status_code;
        var networkErrorMsg = message.payload.duration === 0 ? message.payload.responseText : "";
        var dataLength = message.payload.content_length ? message.payload.content_length : 0;
        var domainAndPath = utils_1.getDomainAndPathInfoFromUrl(message.payload.url);
        return {
            time: Date.now(),
            type: "auto_captured",
            name: "monitor",
            app_version: this.appVersion,
            sdk_version: VERSION,
            sdk_id: this.uuid,
            tag: tag,
            content: JSON.stringify({
                domain: domainAndPath.domain,
                path: domainAndPath.path,
                path1: domainAndPath.path1,
                path2: domainAndPath.path2,
                path3: domainAndPath.path3,
                path4: domainAndPath.path4,
                query: domainAndPath.query,
                url: message.payload.url,
                method: message.payload.method,
                host_ip: "",
                status_code: statusCode,
                start_timestamp: startTimestamp,
                response_time_stamp: responseTimeStamp,
                end_timestamp: endTimeStamp,
                dns_time: 0,
                data_length: dataLength,
                network_error_code: networkErrorCode,
                network_error_msg: networkErrorMsg,
            })
        };
    };
    WebData.prototype.initErrorData = function (message, tag) {
        var crash_log_key = JSON.stringify(message.payload.stack);
        return {
            time: Date.now(),
            type: "auto_captured",
            name: "crash",
            app_version: this.appVersion,
            sdk_version: VERSION,
            sdk_id: this.uuid,
            tag: tag,
            content: JSON.stringify({
                crash_log_key: crash_log_key,
                crash_time: message.timestamp,
                mode: message.payload.mode,
                message: message.payload.message,
            })
        };
    };
    WebData.prototype.initConsoleData = function (message, tag) {
        return {
            time: Date.now(),
            type: "auto_captured",
            name: "log",
            app_version: this.appVersion,
            sdk_version: VERSION,
            sdk_id: this.uuid,
            tag: tag,
            content: JSON.stringify({
                level: message.payload.level,
                message: message.payload.message,
            })
        };
    };
    WebData.prototype.initAppConfigData = function (tag) {
        return {
            time: Date.now(),
            type: "auto_captured",
            name: "app",
            app_version: this.appVersion,
            sdk_version: VERSION,
            sdk_id: this.uuid,
            tag: tag,
        };
    };
    WebData.prototype.initTransactionsData = function () {
        return {
            time: Date.now(),
            type: "custom",
            name: "auto_captured_transaction",
            app_version: this.appVersion,
            sdk_version: VERSION,
            sdk_id: this.uuid,
            tag: this.tag,
            content: "",
        };
    };
    WebData.prototype.changeStringToBoolean = function (enabled) {
        if (enabled === "" || enabled === "true" || enabled === null) {
            return true;
        }
        return false;
    };
    return WebData;
}());
exports.WebData = WebData;
var webData = new WebData();
exports.default = webData;
//# sourceMappingURL=web-data.js.map