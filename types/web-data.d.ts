export declare class WebData {
    appId: string;
    domain: string;
    tag: string;
    ajaxEnabled: boolean;
    crashEnabled: boolean;
    webPerfEnabled: boolean;
    uuid: string;
    performanceFilter: any;
    constructor();
    init(appId: string, domain: string, ajaxEnabled: string, crashEnabled: string, webPerfEnabled: string): void;
    setTag(tag: string): void;
    setPerformanceFilter(filter: any): void;
    getAppConfig(): void;
    setAppConfig(newAppConfig: any): void;
    getSendDataConfig(): any;
    sendEventData(name: string, data: any): any;
    push(datas: any): any;
    getRequestFun(url: string, type: string, result: string): any;
    postDataUrl(domain: string, category: string, appId: string): string;
    initCustomEvent(tag: string, name: string, content: string): any;
    initPerformance(message: any, tag: string): any;
    initNetworkData(message: any, tag: string): any;
    initErrorData(message: any, tag: string): any;
    initAppConfigData(tag: string): any;
    changeStringToBoolean(enabled: string): boolean;
}
declare const webData: WebData;
export default webData;
