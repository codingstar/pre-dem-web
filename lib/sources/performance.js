"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var source_1 = require("../source");
var utils_1 = require("./../utils");
var web_data_1 = require("./../web-data");
exports.default = function () {
    return new source_1.default('performance', function (action) {
        window.onload = function () {
            web_data_1.default.getAppConfig();
            setTimeout(function () {
                var timing = null;
                var newResourceTimings = [];
                if (!window.performance) {
                    return false;
                }
                timing = performance.timing;
                if (window.performance.getEntries) {
                    var resourceTimings = window.performance.getEntries();
                    if (resourceTimings && resourceTimings.length > 0) {
                        resourceTimings.map(function (resourceTiming) {
                            if (resourceTiming.entryType === "resource" && resourceTiming.connectStart !== 0
                                && resourceTiming.duration !== 0 && resourceTiming.requestStart !== 0
                                && resourceTiming.domainLookupStart !== 0) {
                                var cleanObject = JSON.parse(JSON.stringify(resourceTiming));
                                var domainAndPath = utils_1.getDomainAndPathInfoFromUrl(cleanObject.name);
                                cleanObject.domain = domainAndPath.domain;
                                cleanObject.path = domainAndPath.path;
                                cleanObject.path1 = domainAndPath.path1;
                                cleanObject.path2 = domainAndPath.path2;
                                cleanObject.path3 = domainAndPath.path3;
                                cleanObject.path4 = domainAndPath.path4;
                                cleanObject.query = domainAndPath.query;
                                newResourceTimings.push(cleanObject);
                            }
                        });
                        action({
                            category: 'performance',
                            payload: { timing: timing, resourceTimings: newResourceTimings }
                        });
                    }
                }
                else {
                    action({
                        category: 'performance',
                        payload: { timing: timing, resourceTimings: [] }
                    });
                }
            }, 1500);
        };
    });
};
//# sourceMappingURL=performance.js.map