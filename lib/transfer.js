"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var store_1 = require("./store");
var Transfer = (function () {
    function Transfer(name, transferFunc) {
        if (transferFunc === void 0) { transferFunc = duplex; }
        this.queue = [];
        this.running = false;
        this.name = name;
        this.configStore = new store_1.Store("transfer:" + name);
        this.transfer = transferFunc;
    }
    Transfer.prototype.config = function (keyOrObject, value) {
        if (typeof keyOrObject === 'string') {
            var key = keyOrObject;
            this.configStore.set(key, value);
        }
        else {
            for (var key in keyOrObject) {
                if (keyOrObject.hasOwnProperty(key)) {
                    var value_1 = keyOrObject[key];
                    this.config(key, value_1);
                }
            }
        }
    };
    Transfer.prototype.send = function (message) {
        var _this = this;
        var data = message.data, sent = message.sent;
        this.queue.push(function (callback) {
            _this.transfer.call(_this, _this.extendMessage(data), function (err) {
                if (err) {
                    return callback(err);
                }
                message.sent = true;
                callback();
            });
        });
        if (!this.running) {
            this.run();
        }
    };
    Transfer.prototype.sendArray = function (messages) {
        var _this = this;
        var dataArray = [];
        messages.map(function (message) {
            dataArray.push(message.data);
        });
        this.queue.push(function (callback) {
            _this.transfer.call(_this, _this.extendMessages(dataArray), function (err) {
                if (err) {
                    return callback(err);
                }
                messages.map(function (message) {
                    message.sent = true;
                });
                callback();
            });
        });
        if (!this.running) {
            this.run();
        }
    };
    Transfer.prototype.extendMessages = function (messages) {
        var _this = this;
        messages.map(function (message) {
            if (_this.configStore.has('user')) {
                message['user'] = _this.configStore.get('user');
            }
            if (_this.configStore.has('tags')) {
                message['tags'] = _this.configStore.get('tags');
            }
            if (_this.configStore.has('extra')) {
                message['extra'] = _this.configStore.get('extra');
            }
            if (_this.configStore.has('release')) {
                message['release'] = _this.configStore.get('release');
            }
            if (_this.configStore.has('environment')) {
                message['environment'] = _this.configStore.get('environment');
            }
        });
        return messages;
    };
    Transfer.prototype.extendMessage = function (message) {
        if (this.configStore.has('user')) {
            message['user'] = this.configStore.get('user');
        }
        if (this.configStore.has('tags')) {
            message['tags'] = this.configStore.get('tags');
        }
        if (this.configStore.has('extra')) {
            message['extra'] = this.configStore.get('extra');
        }
        if (this.configStore.has('release')) {
            message['release'] = this.configStore.get('release');
        }
        if (this.configStore.has('environment')) {
            message['environment'] = this.configStore.get('environment');
        }
        return message;
    };
    Transfer.prototype.run = function () {
        var _this = this;
        var current = this.queue.splice(0, 1)[0]; // .shift()
        if (current) {
            this.running = true;
            current(function () { return _this.run(); });
        }
        else {
            this.running = false;
        }
    };
    return Transfer;
}());
exports.default = Transfer;
function duplex(value) {
    return value;
}
//# sourceMappingURL=transfer.js.map