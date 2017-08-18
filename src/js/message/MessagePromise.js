export default class MessagePromise {

    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }

    getPromise() {
        return this.promise;
    }

    resolve(data) {
        this.resolve.apply(null, data);
    }

    reject(data) {
        this.reject.apply(null, data);
    }
}
