"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ava_1 = require("ava");
var store_1 = require("./store");
ava_1.default('storage', function (t) {
    var storage = new store_1.Storage();
    storage.setItem('foo', 'bar');
    t.is(storage.getItem('foo'), 'bar');
    storage.removeItem('foo');
    t.is(storage.getItem('foo'), undefined);
});
//# sourceMappingURL=store.spec.js.map