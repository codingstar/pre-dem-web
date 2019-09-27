"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TraceKit = require("tracekit");
// Detection
var detection_1 = require("./detection");
// Store
var store_1 = require("./store");
var messages_store_1 = require("./messages-store");
// Transfer
var transfer_1 = require("./transfer");
// Sources
var source_1 = require("./source");
var xhr_1 = require("./sources/xhr");
var exception_1 = require("./sources/exception");
var performance_1 = require("./sources/performance");
var console_1 = require("./sources/console");
// Logger
var logger_1 = require("./logger");
var utils_1 = require("./utils");
var DEFAULT_DEM_OPTION = {
    environment: 'production',
    autoInstall: true,
    instrument: {
        tryCatch: true
    },
    autoBreadcrumbs: {
        xhr: true,
        console: true,
        performance: true
    }
};
var Dem = (function () {
    function Dem(option) {
        if (option === void 0) { option = {}; }
        this.callbacks = {};
        this.configStore = new store_1.Store('config');
        this.contextStore = new store_1.Store('context');
        this.messages = new messages_store_1.MessagesStore(this);
        this.transfers = [];
        this.sources = [];
        this.__wrappedBuiltins = [];
        this._ignoreOnError = 0;
        this.option = utils_1.merge(utils_1.clone(DEFAULT_DEM_OPTION), option);
        if (this.option.debug) {
            this.debug = true;
        }
        // Set Up
        if (this.option.release) {
            this.setRelease(this.option.release);
        }
        if (this.option.environment) {
            this.setEnvironment(this.option.environment);
        }
        if (this.option.transfer) {
            this.addTransfer(this.option.transfer);
        }
        if (this.option.transfers) {
            for (var _i = 0, _a = this.option.transfers; _i < _a.length; _i++) {
                var transfer = _a[_i];
                this.addTransfer(transfer);
            }
        }
        if (this.option.sources) {
            for (var _b = 0, _c = this.option.sources; _b < _c.length; _b++) {
                var source = _c[_b];
                this.addSource(source);
            }
        }
        if (this.option.autoInstall) {
            this.install();
        }
    }
    Object.defineProperty(Dem.prototype, "Transfer", {
        get: function () {
            return transfer_1.default;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Dem.prototype, "Source", {
        get: function () {
            return source_1.default;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Dem.prototype, "logger", {
        get: function () {
            return logger_1.default;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Dem.prototype, "debug", {
        get: function () {
            return this.configStore.get('debug') || false;
        },
        set: function (value) {
            if (value === true) {
                logger_1.default.info("[CONFIG] set debug = " + value);
            }
            this.configStore.set('debug', value);
        },
        enumerable: true,
        configurable: true
    });
    Dem.prototype.install = function () {
        // Instrument TryCatch
        if (this.option.instrument && this.option.instrument['tryCatch']) {
            this.addSource(exception_1.default());
        }
        // Instrumeny Breadcrumb
        if (this.option.autoBreadcrumbs) {
            this._setupBreadcrumb();
        }
        return this;
    };
    Dem.prototype.uninstall = function () {
        // Restore wrapped builtins
        this._restoreBuiltIns();
        // Dispose all sources
        this.sources.forEach(function (source) { return source.dispose(); });
        return this;
    };
    Dem.prototype.addSource = function (source) {
        var _this = this;
        if (!source)
            return;
        source.onAction(function (message) { return _this.messages.add(message); });
        this.sources.push(source);
        if (this.debug) {
            this.logger.info("[SOURCE] added source " + source.name);
        }
        return this;
    };
    Dem.prototype.addTransfer = function (transfer) {
        transfer.config(this.configStore.toJS());
        this.transfers.push(transfer);
        if (this.debug) {
            this.logger.info("[TRANSFER] added transfer " + transfer.name);
        }
        return this;
    };
    Dem.prototype.config = function (keyOrObject, value) {
        if (typeof keyOrObject === 'string') {
            var key = keyOrObject;
            this.configStore.set(key, value);
            if (this.debug) {
                this.logger.info("[CONFIG] set " + key + " = " + value);
            }
        }
        else {
            for (var key in keyOrObject) {
                if (keyOrObject.hasOwnProperty(key)) {
                    var value_1 = keyOrObject[key];
                    this.config(key, value_1);
                }
            }
        }
        return this;
    };
    Dem.prototype.captureException = function (ex, options) {
        if (options === void 0) { options = {}; }
        // If not an Error is passed through, recall as a message instead
        if (!utils_1.isError(ex)) {
            return this.captureException(ex, utils_1.merge({
                trimHeadFrames: 1,
                stacktrace: true // if we fall back to captureMessage, default to attempting a new trace
            }, options));
        }
        try {
            TraceKit.report(ex);
        }
        catch (ex1) {
            if (ex !== ex1) {
                throw ex1;
            }
        }
        if (this.debug) {
            this.logger.error("[EXCEPTION] capture exception: " + ex.message);
        }
        return this;
    };
    Dem.prototype.setUserContext = function (user) {
        var _this = this;
        this.contextStore.set('user', user);
        if (this.transfers.length > 0) {
            this.transfers.forEach(function (transfer) { return transfer.config(_this.contextStore.toJS()); });
        }
        if (this.debug) {
            this.logger.info("[CONTEXT] set user context: " + user);
        }
        return this;
    };
    Dem.prototype.setTagsContext = function (tags) {
        var _this = this;
        this.contextStore.set('tags', tags);
        if (this.transfers.length > 0) {
            this.transfers.forEach(function (transfer) { return transfer.config(_this.contextStore.toJS()); });
        }
        if (this.debug) {
            this.logger.info("[CONTEXT] set tags context: " + tags);
        }
        return this;
    };
    Dem.prototype.setExtraContext = function (extra) {
        var _this = this;
        this.contextStore.set('extra', extra);
        if (this.transfers.length > 0) {
            this.transfers.forEach(function (transfer) { return transfer.config(_this.contextStore.toJS()); });
        }
        if (this.debug) {
            this.logger.info("[CONTEXT] set extra context: " + extra);
        }
        return this;
    };
    Dem.prototype.clearContext = function () {
        this.contextStore.clear();
        if (this.debug) {
            this.logger.info("[CONTEXT] clear context");
        }
        return this;
    };
    Dem.prototype.getContext = function () {
        return this.contextStore.toJS();
    };
    Dem.prototype.setEnvironment = function (env) {
        this.contextStore.set('environment', env);
        if (this.debug) {
            this.logger.info("[CONTEXT] set environment context: " + env);
        }
        return this;
    };
    Dem.prototype.setRelease = function (release) {
        this.contextStore.set('release', release);
        if (this.debug) {
            this.logger.info("[CONTEXT] set release context: " + release);
        }
        return this;
    };
    Dem.prototype.getCallback = function (key) {
        if (utils_1.isNil(this.callbacks[key])) {
            return function () { return false; };
        }
        return this.callbacks[key];
    };
    Dem.prototype.setCallback = function (key, callback) {
        if (utils_1.isUndefined(callback)) {
            this.callbacks[key] = null;
            if (this.debug) {
                logger_1.default.info("[CALLBACK] remove " + key + " callback");
            }
        }
        else if (utils_1.isFunction(callback)) {
            this.callbacks[key] = callback;
            if (this.debug) {
                logger_1.default.info("[CALLBACK] set " + key + " callback");
            }
        }
    };
    Dem.prototype.setBreadcrumbCallback = function (callback) {
        var original = this.getCallback('breadcrumb');
        this.setCallback('breadcrumb', composeCallback(original, callback));
    };
    Dem.prototype.setExceptionCallback = function (callback) {
        var original = this.getCallback('exception');
        this.setCallback('exception', composeCallback(original, callback));
    };
    Dem.prototype.wrap = function (options, func, _before) {
        if (utils_1.isUndefined(func) && !utils_1.isFunction(options)) {
            return options;
        }
        if (utils_1.isFunction(options)) {
            func = options;
            options = undefined;
        }
        if (!utils_1.isFunction(func)) {
            return func;
        }
        try {
            if (func.__dem__) {
                return func;
            }
            if (func.__dem_wrapper__) {
                return func.__dem_wrapper__;
            }
        }
        catch (e) {
            return func;
        }
        var self = this;
        function wrapped() {
            var args = [], i = arguments.length, deep = !options || options && options.deep !== false;
            if (_before && utils_1.isFunction(_before)) {
                _before.apply(this, arguments);
            }
            while (i--)
                args[i] = deep ? self.wrap(options, arguments[i]) : arguments[i];
            try {
                return func.apply(this, args);
            }
            catch (e) {
                self._ignoreNextOnError();
                self.captureException(e, options);
                throw e;
            }
        }
        for (var prop in func) {
            if (utils_1.hasKey(func, prop)) {
                wrapped[prop] = func[prop];
            }
        }
        wrapped.prototype = func.prototype;
        func.__dem_wrapper__ = wrapped;
        wrapped['__dem__'] = true;
        wrapped['__inner__'] = func;
        if (this.debug) {
            var funcName = func.name || 'anynomous';
            logger_1.default.info("wrap function " + funcName);
        }
        return wrapped;
    };
    Dem.prototype.context = function (func, argsOrOptions, options) {
        var args = null;
        var opts = undefined;
        switch (true) {
            case utils_1.isArray(argsOrOptions) && utils_1.isUndefined(options):// overload +1
                args = argsOrOptions;
                break;
            case !utils_1.isArray(argsOrOptions) && utils_1.isUndefined(options):// overload +2
                args = [];
                opts = argsOrOptions;
                break;
            case utils_1.isArray(argsOrOptions) && !utils_1.isUndefined(options):// overload +3
                args = argsOrOptions;
                opts = options;
                break;
        }
        return this.wrap(options, func).apply(this, args);
    };
    Dem.prototype._ignoreNextOnError = function () {
        var _this = this;
        this._ignoreOnError += 1;
        setTimeout(function () {
            _this._ignoreOnError -= 1;
        });
    };
    Dem.prototype._setupBreadcrumb = function () {
        if (this.option.autoBreadcrumbs['xhr'] || this.option.autoBreadcrumbs === true) {
            this.addSource(xhr_1.default(this));
        }
        if (this.option.autoBreadcrumbs['performance'] || this.option.autoBreadcrumbs === true) {
            this.addSource(performance_1.default());
        }
        if (this.option.autoBreadcrumbs['console'] || this.option.autoBreadcrumbs === true) {
            this.addSource(console_1.default());
        }
    };
    Dem.prototype._restoreBuiltIns = function () {
        for (var _i = 0, _a = this.__wrappedBuiltins; _i < _a.length; _i++) {
            var _b = _a[_i], obj = _b[0], name_1 = _b[1], orig = _b[2];
            obj[name_1] = orig;
        }
    };
    return Dem;
}());
exports.Dem = Dem;
var dem = new Dem(detection_1._window.dem_option || {});
exports.default = dem;
function composeCallback(original, callback) {
    return utils_1.isFunction(callback)
        ? function (data) { return callback(data, original); }
        : callback;
}
//# sourceMappingURL=dem.js.map