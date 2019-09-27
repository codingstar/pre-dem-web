import Transaction from "./transaction";
export interface IPredemOptions {
    appKey: string;
    domain: string;
    httpEnabled?: boolean;
    crashEnabled?: boolean;
    performanceEnabled?: boolean;
    bufferCapacity?: number;
}
export declare class Predem {
    init(options: IPredemOptions): void;
    setTag(tag: string): void;
    setAppVersion(version: string): void;
    setPerformanceFilter(filterFunc: any): void;
    captureException(err: Error): void;
    sendEvents(events: any[]): any;
    sendEvent(event: any): void;
    transactionStart(name: string): Transaction;
    private initTransfer();
}
declare const predem: Predem;
export default predem;
