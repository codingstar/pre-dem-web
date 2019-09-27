"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var detection_1 = require("./detection");
function fill(obj, name, replacement, track) {
    var orig = obj[name];
    obj[name] = replacement(orig);
    if (track) {
        track.push([obj, name, orig]);
    }
}
exports.fill = fill;
var dataAttrRegex = /^data-/;
function serializeDOMElement(dom) {
    var dataSet = [].slice.call(dom.attributes)
        .filter(function (attr) { return dataAttrRegex.test(attr.name); })
        .map(function (attr) { return [
        attr.name.substr(5).replace(/-(.)/g, function ($0, $1) { return $1.toUpperCase(); }),
        attr.value
    ]; });
    var data = {};
    for (var _i = 0, dataSet_1 = dataSet; _i < dataSet_1.length; _i++) {
        var _a = dataSet_1[_i], key = _a[0], value = _a[1];
        data[key] = value;
    }
    var serialization = {
        tag: dom.tagName,
        class: dom.className !== '' ? dom.className.split(' ').filter(Boolean) : null,
        id: dom.id || null,
        data: data
    };
    return serialization;
}
exports.serializeDOMElement = serializeDOMElement;
var MAX_TRAVERSE_HEIGHT = 5;
var MAX_OUTPUT_LEN = 80;
function htmlTreeAsString(elem) {
    /* eslint no-extra-parens:0*/
    var out = [];
    var separator = ' > ';
    var sepLength = separator.length;
    var height = 0;
    var len = 0;
    var nextStr;
    while (elem && height++ < MAX_TRAVERSE_HEIGHT) {
        nextStr = htmlElementAsString(elem);
        if (nextStr === 'html' || height > 1 && len + (out.length * sepLength) + nextStr.length >= MAX_OUTPUT_LEN) {
            break;
        }
        out.push(nextStr);
        len += nextStr.length;
        elem = elem.parentNode;
    }
    return out.reverse().join(separator);
}
exports.htmlTreeAsString = htmlTreeAsString;
function htmlElementAsString(elem) {
    var out = [];
    var className;
    var classes;
    var key;
    var attr;
    var i;
    if (!elem || !elem.tagName) {
        return '';
    }
    out.push(elem.tagName.toLowerCase());
    if (elem.id) {
        out.push('#' + elem.id);
    }
    className = elem.className;
    if (className && typeof className === 'string') {
        classes = className.split(/\s+/);
        for (i = 0; i < classes.length; i++) {
            out.push('.' + classes[i]);
        }
    }
    var attrWhitelist = ['type', 'name', 'title', 'alt'];
    for (i = 0; i < attrWhitelist.length; i++) {
        key = attrWhitelist[i];
        attr = elem.getAttribute(key);
        if (attr) {
            out.push('[' + key + '="' + attr + '"]');
        }
    }
    return out.join('');
}
exports.htmlElementAsString = htmlElementAsString;
var objectPrototype = Object.prototype;
function hasKey(object, key) {
    return objectPrototype.hasOwnProperty.call(object, key);
}
exports.hasKey = hasKey;
function merge(target, source) {
    var obj = {};
    for (var key in target) {
        obj[key] = target[key];
    }
    for (var key in source) {
        obj[key] = source[key];
    }
    return obj;
}
exports.merge = merge;
// Simple type check utils
function isString(raw) {
    return typeof raw === 'string';
}
exports.isString = isString;
function isNull(raw) {
    return raw === null;
}
exports.isNull = isNull;
function isUndefined(raw) {
    return raw === void 0;
}
exports.isUndefined = isUndefined;
function isObject(raw) {
    return typeof raw === 'object';
}
exports.isObject = isObject;
function isError(raw) {
    return raw instanceof Error;
}
exports.isError = isError;
function isNil(raw) {
    return isNull(raw) || isUndefined(raw);
}
exports.isNil = isNil;
function isFunction(raw) {
    return typeof raw === 'function' &&
        raw.call && raw.apply;
}
exports.isFunction = isFunction;
function isArray(raw) {
    return raw instanceof Array && raw.push && raw.pop && raw.length;
}
exports.isArray = isArray;
function clone(raw) {
    if (detection_1.hasJSON) {
        return JSON.parse(JSON.stringify(raw));
    }
    else {
        return raw;
    }
}
exports.clone = clone;
function timestampToUTCStr(timestamp) {
    var date = new Date(timestamp - 8 * 60 * 60 * 1000);
    var dateStr = convertDateToDateStr(date, true, "-").replace(" ", "T");
    dateStr += "Z";
    return dateStr;
}
exports.timestampToUTCStr = timestampToUTCStr;
function convertDateToDateStr(oldDate, hasHour, separator) {
    var dateStr = (oldDate.getFullYear()) + separator;
    if (oldDate.getMonth() + 1 < 10) {
        dateStr += "0" + (oldDate.getMonth() + 1) + separator;
    }
    else {
        dateStr = dateStr + (oldDate.getMonth() + 1) + separator;
    }
    if (oldDate.getDate() < 10) {
        dateStr += "0" + (oldDate.getDate());
    }
    else {
        dateStr += (oldDate.getDate());
    }
    if (!hasHour) {
        return dateStr;
    }
    dateStr += " ";
    if (oldDate.getHours() < 10) {
        dateStr += "0" + (oldDate.getHours()) + ":";
    }
    else {
        dateStr += (oldDate.getHours()) + ":";
    }
    if (oldDate.getMinutes() < 10) {
        dateStr += "0" + (oldDate.getMinutes()) + ":";
    }
    else {
        dateStr += (oldDate.getMinutes()) + ":";
    }
    if (oldDate.getSeconds() < 10) {
        dateStr += "0" + (oldDate.getSeconds());
    }
    else {
        dateStr += (oldDate.getSeconds());
    }
    return dateStr;
}
exports.convertDateToDateStr = convertDateToDateStr;
function getCookier(name) {
    var reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    var arr = document.cookie.match(reg);
    if (arr) {
        return unescape(arr[2]);
    }
    return null;
}
exports.getCookier = getCookier;
function setCookier(name, value) {
    document.cookie = name + "=" + value + ";";
}
exports.setCookier = setCookier;
function getBrowserInfo() {
    var ua = window.navigator.userAgent.toLowerCase();
    if (ua.indexOf("firefox") >= 0) {
        var ver = ua.match(/firefox\/([\d.]+)/)[1];
        return { type: "Firefox", version: ver };
    }
    else if (ua.indexOf("chrome") >= 0) {
        var ver = ua.match(/chrome\/([\d.]+)/)[1];
        return { type: "Chrome", version: ver };
    }
    else if (ua.indexOf("opera") >= 0) {
        var ver = ua.match(/opera.([\d.]+)/)[1];
        return { type: "Opera", version: ver };
    }
    else if (ua.indexOf("safari") >= 0) {
        var ver = ua.match(/version\/([\d.]+)/)[1];
        return { type: "Safari", version: ver };
    }
    else if (!!window["ActiveXObject"] || "ActiveXObject" in window) {
        var rMsie = /(msie\s|trident.*rv:)([\w.]+)/;
        var match = rMsie.exec(ua);
        return { type: "IE", version: match[2] };
    }
    return { type: "", version: "" };
}
exports.getBrowserInfo = getBrowserInfo;
// 获取当前的 script
function getCurrentScript() {
    if (document.currentScript) {
        return document.currentScript;
    }
    var current_script;
    var reg = ".*pre-dem-web-v.*\.js";
    var scripts = document.getElementsByTagName("script");
    for (var i = 0, script = void 0, l = scripts.length; i < l; i++) {
        script = scripts[i];
        var src = script.src || "";
        var mat = src.match(reg);
        if (mat) {
            current_script = script;
            break;
        }
    }
    return current_script;
}
exports.getCurrentScript = getCurrentScript;
function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}
exports.generateUUID = generateUUID;
;
function localStorageIsSupported() {
    try {
        localStorage.setItem('supported', '1');
        localStorage.removeItem('supported');
        return true;
    }
    catch (error) {
        return false;
    }
}
exports.localStorageIsSupported = localStorageIsSupported;
;
function stringIsNumber(str) {
    var n = Number(str);
    if (!isNaN(n)) {
        return true;
    }
    return false;
}
exports.stringIsNumber = stringIsNumber;
/** 判断是否为空 **/
function isEmpty(_value) {
    if (_value === null || _value === "" || _value === undefined) {
        return true;
    }
    return false;
}
exports.isEmpty = isEmpty;
function parseURL(url) {
    var a = document.createElement('a');
    a.href = url;
    return {
        source: url,
        protocol: a.protocol.replace(':', ''),
        host: a.hostname,
        port: a.port,
        query: a.search,
        params: (function () {
            var ret = {}, seg = a.search.replace(/^\?/, '').split('&'), len = seg.length, i = 0, s;
            for (; i < len; i++) {
                if (!seg[i]) {
                    continue;
                }
                if (seg[i].indexOf('=') === -1) {
                    ret[escape(seg[i])] = escape(seg[i]);
                }
                else {
                    s = seg[i].split('=');
                    ret[escape(s[0])] = escape(s[1]);
                }
            }
            return ret;
        })(),
        file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
        hash: a.hash.replace('#', ''),
        path: a.pathname.replace(/^([^\/])/, '/$1'),
        relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [, ''])[1],
        segments: a.pathname.replace(/^\//, '').split('/')
    };
}
exports.parseURL = parseURL;
function getDomainAndPathInfoFromUrl(urlStr) {
    var domain = "";
    var path = "";
    var path1 = "";
    var path2 = "";
    var path3 = "";
    var path4 = "";
    var query = "";
    if (isEmpty(urlStr)) {
        return { domain: domain, path: path, path1: path1, path2: path2, path3: path3, path4: path4, query: query };
    }
    var parseObj = parseURL(urlStr);
    if (parseObj.protocol === "file") {
        return { domain: domain, path: path, path1: path1, path2: path2, path3: path3, path4: path4, query: query };
    }
    var segments = parseObj.segments;
    domain = parseObj.host;
    path = parseObj.path === "/" ? "" : parseObj.path;
    if (segments && segments.length >= 1) {
        path1 = segments[0];
    }
    if (segments && segments.length >= 2) {
        path2 = segments[1];
    }
    if (segments && segments.length >= 3) {
        path3 = segments[2];
    }
    if (segments && segments.length >= 4) {
        path4 = segments.slice(3).join("/");
    }
    var params = parseObj.params;
    query = JSON.stringify(params);
    return { domain: domain, path: path, path1: path1, path2: path2, path3: path3, path4: path4, query: query };
}
exports.getDomainAndPathInfoFromUrl = getDomainAndPathInfoFromUrl;
//# sourceMappingURL=utils.js.map