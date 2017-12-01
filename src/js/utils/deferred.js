/* @flow */

export type Deferred<T> = {
    id?: string;
    promise: Promise<T>;
    resolve: (t: T) => void;
    reject: (e: Error) => void;
};

export type AsyncDeferred<T> = {
    promise: Promise<T>;
    resolve: (t: T) => void;
    reject: (e: Error) => void;
    run: Function;
};


export function create<T>(arg?: (() => Promise<void>) | string): Deferred<T> {
    let localResolve: (t: T) => void = (t: T) => {};
    let localReject: (e?: ?Error) => void = (e: ?Error) => {};
    let id: string;

    const promise: Promise<T> = new Promise((resolve, reject) => {
        localResolve = resolve;
        localReject = reject;
        if (typeof arg === 'function') arg();
        if (typeof arg === 'string') id = arg;
    });

    return {
        id: id,
        resolve: localResolve,
        reject: localReject,
        promise,
    };
}

export function createAsync<T>(innerFn: Function): AsyncDeferred<T> {
    let localResolve: (t: T) => void = (t: T) => {};
    let localReject: (e?: ?Error) => void = (e) => {};

    const promise: Promise<T> = new Promise((resolve, reject) => {
        localResolve = resolve;
        localReject = reject;
    });

    const inner = async (): Promise<void> => {
        await innerFn();
    }

    return {
        resolve: localResolve,
        reject: localReject,
        promise,
        run: () => {
            inner();
            return promise;
        }
    };
}

export function resolveTimeoutPromise<T>(delay: number, result: T): Promise<T> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(result);
        }, delay);
    });
}

export function rejectTimeoutPromise(delay: number, error: Error): Promise<any> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(error);
        }, delay);
    });
}
