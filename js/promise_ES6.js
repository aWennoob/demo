/*
自定义promise class版本
*/
class Promise {
    static PENDING = 'pending';
    static FULFILLED = 'fulfilled';
    static REJECTED = 'rejected';
    constructor(executor) {
        // const that=this;
        this.status = Promise.PENDING;
        this.data = undefined;
        this.callbacks = [];

        try {
            executor(this.resolve.bind(this), this.reject.bind(this))
        } catch (error) {
            this.reject(error)
        }
       
       
        // this.then.bind(this);
    }
    resolve(value) {
        if (this.status !== Promise.PENDING) return;
        this.status = Promise.FULFILLED;
        this.data = value;
        if(this.callbacks.length){
            setTimeout(() => {
                this.callbacks.map(callback=>callback.onFulfilled(value))
            });
        }
    }
    reject(reason) {
        if (this.status !== Promise.PENDING) return;
        this.status = Promise.REJECTED;
        this.data = reason;
        if(this.callbacks.length){
            setTimeout(() => {
                this.callbacks.map(callback=>callback.onRejected(reason))
            });
        }
    }
    then(onFulfilled,onRejected){
        onFulfilled=typeof onFulfilled==='function'?onFulfilled:value=>value;
        onRejected=typeof onRejected==='function'?onRejected:reason=>{throw reason};
        const that=this;
        
      
        return new Promise((resolve,reject)=>{
            function handle(callback){
                try {
                    const result=callback(that.data);
                    if(result instanceof Promise){
                        result.then(resolve,reject)
                    }else{
                        resolve(result)
                    }
                } catch (error) {
                    reject(error)
                }
            }
            if(that.status===Promise.FULFILLED){
                setTimeout(() => {
                    handle(onFulfilled)
                });
            }
            if(that.status===Promise.REJECTED){
                setTimeout(() => {
                    handle(onRejected)
                });
            }
            if(that.status===Promise.PENDING){
                that.callbacks.push({
                    onFulfilled:function(){handle(onFulfilled)},
                    onRejected(){handle(onRejected)}
                })
            }
        })

        
    }
    catch(onRejected){
        return this.then(undefined,onRejected)
    }
    
}