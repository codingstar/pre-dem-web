"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var source_1 = require("../source");
var utils_1 = require("../utils");
var detection_1 = require("../detection");
function genXHRMessage(action, method, url, status_code) {
    if (status_code === void 0) { status_code = null; }
    return {
        action: action, method: method, url: url, status_code: status_code, duration: 0
    };
}
exports.default = function (dem) {
    function wrapProp(prop, xhr) {
        if (prop in xhr && utils_1.isFunction(xhr[prop])) {
            utils_1.fill(xhr, prop, function (orig) { return dem.wrap(orig); }); // intentionally don't track filled methods on XHR instances
        }
    }
    if (!detection_1._window)
        return null;
    return new source_1.default('breadcrumb.XHR', function (action) {
        // XMLHttpRequest
        if ('XMLHttpRequest' in detection_1._window) {
            var xhrproto = XMLHttpRequest.prototype;
            utils_1.fill(xhrproto, 'open', function (originFunc) {
                return function (method, url) {
                    this.__dem_xhr = genXHRMessage('open', method, url);
                    return originFunc.apply(this, arguments);
                };
            }, dem.__wrappedBuiltins);
            utils_1.fill(xhrproto, 'send', function (originFunc) {
                return function (data) {
                    var xhr = this;
                    xhr.__dem_xhr.start_timestamp = Date.now();
                    var timeChecker = setTimeout(function () { return action({
                        category: 'network',
                        payload: xhr.__dem_xhr
                    }); }, 30 * 1000 /* 30 sec */);
                    function onreadystatechangeHandler() {
                        if (xhr.__dem_xhr && (xhr.readyState === 2)) {
                            xhr.__dem_xhr.response_timestamp = Date.now();
                        }
                        if (xhr.__dem_xhr && (xhr.readyState === 1 || xhr.readyState === 4)) {
                            if (timeChecker) {
                                clearTimeout(timeChecker);
                            }
                            try {
                                // touching statusCode in some platforms throws
                                // an exception
                                xhr.__dem_xhr.end_timestamp = Date.now();
                                xhr.__dem_xhr.status_code = xhr.status;
                                xhr.__dem_xhr.duration = xhr.__dem_xhr.end_timestamp - xhr.__dem_xhr.start_timestamp;
                                xhr.__dem_xhr.response_text = xhr.responseText;
                                var contentLength = xhr.responseText ? xhr.responseText.length : 0;
                                xhr.__dem_xhr.content_length = contentLength;
                            }
                            catch (e) { }
                            action({
                                category: 'network',
                                payload: xhr.__dem_xhr
                            });
                        }
                    }
                    function onloadstart(e) {
                        xhr.__dem_xhr.response_timestamp = Date.now();
                    }
                    function onload(e) {
                        xhr.__dem_xhr.status_code = e.target.status;
                        xhr.__dem_xhr.response_text = e.target.responseText;
                        xhr.__dem_xhr.content_length = e.total;
                        xhr.__dem_xhr.end_timestamp = Date.now();
                        xhr.__dem_xhr.duration = xhr.__dem_xhr.end_timestamp - xhr.__dem_xhr.start_timestamp;
                        action({
                            category: 'network',
                            payload: xhr.__dem_xhr
                        });
                    }
                    var props = ['onload', 'onerror', 'onprogress'];
                    for (var _i = 0, props_1 = props; _i < props_1.length; _i++) {
                        var prop = props_1[_i];
                        wrapProp(prop, xhr);
                    }
                    var jqueryVersion = window["$"] ? window["$"].prototype.jquery : "";
                    if (jqueryVersion !== "") {
                        var array = jqueryVersion.split(".");
                        var firstVersion = array[0];
                        var secondVersion = array[1];
                        if (parseInt(firstVersion) < 2 && parseInt(secondVersion) >= 6) {
                            if ('onloadstart' in xhr && utils_1.isFunction(xhr.onloadstart)) {
                                utils_1.fill(xhr, 'onloadstart', function (orig) { return dem.wrap(orig, undefined, onloadstart); });
                            }
                            else {
                                xhr.onloadstart = onloadstart;
                            }
                            if ('onload' in xhr && utils_1.isFunction(xhr.onload)) {
                                utils_1.fill(xhr, 'onload', function (orig) { return dem.wrap(orig, undefined, onload); });
                            }
                            else {
                                xhr.onload = onload;
                            }
                        }
                        else if (parseInt(firstVersion) >= 2) {
                            if ('onreadystatechange' in xhr && utils_1.isFunction(xhr.onreadystatechange)) {
                                utils_1.fill(xhr, 'onreadystatechange', function (orig) { return dem.wrap(orig, undefined, onreadystatechangeHandler); });
                            }
                            else {
                                xhr.onreadystatechange = onreadystatechangeHandler;
                            }
                        }
                        else {
                            console.error("jquert 版本过低,不兼容");
                        }
                    }
                    else {
                        if ('onreadystatechange' in xhr && utils_1.isFunction(xhr.onreadystatechange)) {
                            utils_1.fill(xhr, 'onreadystatechange', function (orig) { return dem.wrap(orig, undefined, onreadystatechangeHandler); });
                        }
                        else {
                            xhr.onreadystatechange = onreadystatechangeHandler;
                        }
                    }
                    return originFunc.apply(this, arguments);
                };
            }, dem.__wrappedBuiltins);
        }
        // Fetch API
        if ('fetch' in detection_1._window) {
            detection_1._window['_origin_fetch'] = detection_1._window.fetch;
            utils_1.fill(detection_1._window, 'fetch', function (origFetch) {
                return function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    var fetchInput = args[0];
                    var method = 'GET';
                    var url = null;
                    if (typeof fetchInput === 'string') {
                        url = fetchInput;
                    }
                    else {
                        url = fetchInput.url;
                        if (fetchInput.method) {
                            method = fetchInput.method;
                        }
                    }
                    if (args[1] && args[1].method) {
                        method = args[1].method;
                    }
                    var fetchData = {
                        method: method, url: url, status_code: null, duration: 0, responseTimestamp: 0,
                    };
                    var startAt = Date.now();
                    var timeChecker = setTimeout(function () { return action({
                        category: 'network',
                        payload: fetchData
                    }); }, 30 * 1000 /* 30 sec */);
                    return origFetch.apply(detection_1._window, args).then(function (resp) {
                        if (timeChecker) {
                            clearTimeout(timeChecker);
                        }
                        fetchData.status_code = resp.status;
                        fetchData.responseTimestamp = Date.now();
                        fetchData.duration = Date.now() - startAt;
                        action({
                            category: 'network',
                            payload: fetchData
                        });
                        return resp;
                    });
                };
            }, dem.__wrappedBuiltins);
        }
    });
};
//# sourceMappingURL=xhr.js.map