import Source from '../source'
import {getDomainFromUrl} from './../utils'
import webData from "./../web-data"
export default () => {
  return new Source('performance', (action) => {
    window.onload = function () {
      webData.getAppConfig();
      setTimeout(() => {
        let timing = null;
        const newResourceTimings = [];
        if (!window.performance) {
          return false;
        }
        timing = performance.timing;
        if (window.performance.getEntries) {
          const resourceTimings = window.performance.getEntries();
          if (resourceTimings && resourceTimings.length > 0) {
            resourceTimings.map((resourceTiming: any) => {
              if (resourceTiming.entryType === "resource" && resourceTiming.connectStart !== 0
                && resourceTiming.duration !== 0 && resourceTiming.requestStart !== 0
                && resourceTiming.domainLookupStart !== 0) {
                var cleanObject = JSON.parse(JSON.stringify(resourceTiming))
                const domainAndPath = getDomainFromUrl(cleanObject.name);
                cleanObject.domain = domainAndPath.domain
                cleanObject.path = domainAndPath.path
                newResourceTimings.push(cleanObject);
              }

            });

            action({
              category: 'performance',
              payload: {timing, resourceTimings: newResourceTimings}
            });
          }

        } else {
          action({
            category: 'performance',
            payload: {timing, resourceTimings: []}
          });
        }
      }, 1500
      );

    };

  })


}