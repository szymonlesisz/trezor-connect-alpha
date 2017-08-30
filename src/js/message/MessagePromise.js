export default class MessagePromise {

    constructor(id:string = null) {
        this.id = id;
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }

    getId():string {
        return this.id;
    }

    getPromise():Promise<any> {
        return this.promise;
    }

    resolve(data:any):void {
        this.resolve.apply(null, data);
    }

    reject(data:any):void {
        this.reject.apply(null, data);
    }
}
