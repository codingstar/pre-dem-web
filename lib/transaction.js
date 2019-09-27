"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var web_data_1 = require("./web-data");
exports.TransactionComplete = "0";
exports.TransactionCancel = "1";
exports.TransactionFail = "2";
var Transaction = (function () {
    function Transaction(name) {
        this.transaction_name = name;
        this.start_time = new Date().getTime();
        this.end_time = 0;
        this.transaction_type = "0";
        this.reason = "";
    }
    Transaction.prototype.complete = function () {
        this.end_time = new Date().getTime();
        this.transaction_type = exports.TransactionComplete;
        this.postTransation();
    };
    Transaction.prototype.cancelWithReason = function (reason) {
        this.end_time = new Date().getTime();
        this.transaction_type = exports.TransactionCancel;
        this.reason = reason;
        this.postTransation();
    };
    Transaction.prototype.failWithReason = function (reason) {
        this.end_time = new Date().getTime();
        this.transaction_type = exports.TransactionFail;
        this.reason = reason;
        this.postTransation();
    };
    Transaction.prototype.initTransactionData = function () {
        var transaction = web_data_1.default.initTransactionsData();
        transaction.content = JSON.stringify({
            transaction_name: this.transaction_name,
            start_time: this.start_time,
            end_time: this.end_time,
            transaction_type: this.transaction_type,
            reason: this.reason,
        });
        return transaction;
    };
    Transaction.prototype.postTransation = function () {
        var url = web_data_1.default.domain + "/v2/" + web_data_1.default.appId + "/transactions";
        var result = JSON.stringify(this.initTransactionData());
        web_data_1.default.request(url, 'POST', 'application/json', result);
    };
    return Transaction;
}());
exports.Transaction = Transaction;
exports.default = Transaction;
//# sourceMappingURL=transaction.js.map