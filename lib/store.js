"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var stringify = JSON.stringify;
var Storage = (function () {
    function Storage() {
        this.data = {};
    }
    Storage.prototype.setItem = function (key, value) {
        this.data[key] = value;
    };
    Storage.prototype.getItem = function (key) {
        var value = this.data[key];
        return value;
    };
    Storage.prototype.removeItem = function (key) {
        delete this.data[key];
    };
    Storage.prototype.clear = function () {
        this.data = {};
    };
    return Storage;
}());
exports.Storage = Storage;
var realStorage = null;
var Store = (function () {
    function Store(name) {
        this.type = Store;
        this._storage = new Storage();
        this.keys = [];
        this.name = name;
    }
    Store.bindRealStorage = function (storage) {
        realStorage = storage;
    };
    Object.defineProperty(Store.prototype, "storage", {
        get: function () {
            if (realStorage) {
                return realStorage;
            }
            else {
                return this._storage;
            }
        },
        enumerable: true,
        configurable: true
    });
    Store.prototype.set = function (key, value) {
        this.storage.setItem(this.name + ":" + key, stringify(value));
        if (this.keys.indexOf(key) === -1) {
            this.keys.push(key);
        }
        return value;
    };
    Store.prototype.get = function (key) {
        var value = this.storage.getItem(this.name + ":" + key);
        if (value) {
            return JSON.parse(value);
        }
        else {
            return null;
        }
    };
    Store.prototype.has = function (key) {
        return this.keys.indexOf(key) >= 0;
    };
    Store.prototype.remove = function (key) {
        this.storage.removeItem(this.name + ":" + key);
        var index = this.keys.indexOf(key);
        if (index >= 0) {
            this.keys.splice(index, 1);
        }
    };
    Store.prototype.clear = function () {
        this.storage.clear();
        this.keys = [];
    };
    Store.prototype.merge = function (source) {
        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                var value = source[key];
                this.set(key, value);
            }
        }
    };
    Store.prototype.toJS = function () {
        var object = {};
        for (var _i = 0, _a = this.keys; _i < _a.length; _i++) {
            var key = _a[_i];
            object[key] = this.get(key);
        }
        return object;
    };
    return Store;
}());
exports.Store = Store;
var CollectionStore = (function (_super) {
    __extends(CollectionStore, _super);
    function CollectionStore() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = CollectionStore;
        return _this;
    }
    Object.defineProperty(CollectionStore.prototype, "length", {
        get: function () {
            return this.collect().length;
        },
        enumerable: true,
        configurable: true
    });
    CollectionStore.prototype.collect = function () {
        return this.get('collection') || [];
    };
    CollectionStore.prototype.push = function (item) {
        var current = this.collect();
        current.push(item);
        this._update(current);
        return current.length;
    };
    CollectionStore.prototype.pop = function () {
        var current = this.collect();
        var item = current.pop();
        this._update(current);
        return item;
    };
    CollectionStore.prototype.shift = function () {
        var current = this.collect();
        var item = current.shift();
        this._update(current);
        return item;
    };
    CollectionStore.prototype.unshift = function (item) {
        var current = this.collect();
        current.unshift(item);
        this._update(current);
        return current.length;
    };
    CollectionStore.prototype._update = function (collection) {
        this.set('collection', collection);
        this.set('length', collection.length);
    };
    return CollectionStore;
}(Store));
exports.CollectionStore = CollectionStore;
//# sourceMappingURL=store.js.map