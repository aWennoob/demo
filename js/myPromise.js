
class MyPromise {
    static PENDING = 'pending';
    static FULFILLED = 'fulfilled';
    static REJECTED = 'rejected';
    constructor(executor) {
        this.status = MyPromise.PENDING;
        this.data = undefined;
        this.callbacks = [];

        const resolve = value => {
            if (this.status !== MyPromise.PENDING) return;
            this.status = MyPromise.FULFILLED;
            this.data = value;
            if (this.callbacks.length) {
                setTimeout(() => {
                    this.callbacks.map(callback => callback.onFulfilled(value))
                });
            }
        }
        const reject = reason => {
            if (this.status !== MyPromise.PENDING) return;
            this.status = MyPromise.REJECTED;
            this.data = reason;
            if (this.callbacks.length) {
                setTimeout(() => {
                    this.callbacks.map(callback => callback.onRejected(reason))
                });
            }
        }
        try {
            executor(resolve, reject)
        } catch (error) {
            reject(error)
        }
    }

    then(onFulfilled, onRejected) {
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
        onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason };

        return new Promise((resolve, reject) => {
            const handle = callback => {

                try {
                    const result = callback(this.data)
                    if (result instanceof Promise) {
                        result.then(resolve, reject)
                    } else {
                        resolve(result)
                    }
                } catch (error) {
                    reject(error)
                }
            }
            if (this.status === MyPromise.FULFILLED) {
                setTimeout(() => {
                    handle(onFulfilled);
                });
            }
            if (this.status === MyPromise.REJECTED) {
                setTimeout(() => {
                    handle(onRejected);
                });
            }
            if (this.status === MyPromise.PENDING) {
                this.callbacks.push({
                    onFulfilled() { handle(onFulfilled) },
                    onRejected() { handle(onRejected) }
                })
            }
        })
    }
    catch(onRejected) {
        return this.then(undefined, onRejected)
    }
    static resolve = function (value) {
        return new MyPromise((resolve, reject) => {
            if (value instanceof Promise) value.then(resolve, reject);
            else resolve(value)
        })
    }
    static reject = function (reason) {
        return new MyPromise(reject => reject(reason))
    }
    static all = function (promises) {
        let count = 0;
        const arr = new Array(promises.length);
        return new MyPromise((resolve, reject) => {
            promises.forEach((p, i) => {
                p.then(
                    value => {
                        count++;
                        arr[i] = value;
                        if (promises.length === count) resolve(arr)
                    },
                    reason => reject(reason)
                )
            })
        })
    }
    static race = function (promises) {
        return new MyPromise((resolve, reject) => {
            promises.map(p => p.then(resolve, reject))
        })
    }
}