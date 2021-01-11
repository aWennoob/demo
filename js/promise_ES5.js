/**
 * 自定义promise函数模块,使用ES5语法
 */

(function (window) {

    const PENDING = 'pending'
    const RESOLVED = 'resolved'
    const REJECTED = 'rejected'
    /**
     * Promise构造函数
     * executor:执行器函数(同步执行)
     */
    function Promise (executor) {
      //将当前promise对象保存起来
      const self = this
      self.status = PENDING //给promise对象指定status，初始值为pending
      self.data = undefined // 给promise对象指定一个用于存储结果数据的属性
      self.callbacks = [] // 每个元素结构：{ onResolved() {}, onRejected() {}}
      function resolve (value) {
        // 如果当前状态不是pending,直接结束
        if (self.status !== PENDING) {
          return 
        }
        //将状态改为resolved
        self.status = RESOLVED
        //保存value数据
        self.data = value
        //如果有待执行的callbacks函数，立即异步执行回调函数onResolved
        if (self.callbacks.length > 0) {
          setTimeout(() => { //放入队列中执行所有成功的回调
            self.callbacks.forEach((callbacksObj) => {
              callbacksObj.onResolved(value)
            })
          })
        }
      }
      function reject (reason) {
        // 如果当前状态不是pending,直接结束
        if (self.status !== PENDING) {
          return 
        }
        //将状态改为rejected
        self.status = REJECTED
        //保存reason数据
        self.data = reason
        //如果有待执行的callbacks函数，立即异步执行回调函数onRejected
        if (self.callbacks.length > 0) {
          setTimeout(() => { //放入队列中执行所有成功的回调
            self.callbacks.forEach((callbacksObj) => {
              callbacksObj.onRejected(reason)
            })
          })
        }
      }
      //立即同步执行executor
      try {
        executor(resolve , reject)
      }catch (error) { //如果执行器抛出异常，promise对象变为rejected
        reject(error)
      }
      
    }
    //promise原型对象的then():指定成功和失败的回调函数，返回一个新的promise对象
    Promise.prototype.then = function (onResolved , onRejected) {
      onResolved = typeof onResolved === 'function' ? onResolved : value => value //向后传递成功的value
  
      //指定默认的失败回调(实现错误/异常穿透的关键步骤)
      onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason } //向后传递失败的reason
  
      const self = this
  
      //返回一个新的promise对象
      return new Promise((resolve , reject) => {
        //调用指定的回调函数处理，根据执行的结果改变return的promise状态
        function handle (callback) {
          try {
            const result = callback(self.data)
            if (result instanceof Promise) {
              /*如果回调函数返回promise，return的promise结果就是这个promise的结果*/
              // result.then(
              //     value  =>  resolve(value), //当result成功时，让return的promise也成功
              //     reason =>  reject(reason) //当result失败时，让return的promise也失败
              // )
              //简洁写法
              result.then(resolve , reject)
            } else {
              /*如果回调函数返回的不是promise，return的promise就会成功，value就是返回的值*/
              resolve(result)
            }
          } catch (error) {
            reject(error)
          }
        }
        if (self.status === PENDING) {
          //当前状态是pending状态,将回调函数保存起来
          self.callbacks.push({
            onResolved () {
              handle(onResolved)
            },
            onRejected () {
              handle(onRejected)
            }
          })
        } else if (self.status === RESOLVED) { //如果当前是resolved状态，异步执行onResolved并改变return的promise状态
          setTimeout(() => {
            handle(onResolved)
          })
        } else { //如果当前是rejected状态，异步执行onRejected并改变return的promise状态
          setTimeout(() => {
            handle(onRejected)
          })
        }
      })
    }
    //promise原型对象的catch()：指定失败的回调函数，返回一个新的promise
    Promise.prototype.catch = function (onRejected) {
      return this.then(undefined , onRejected)
    }
    /**
     * Promise函数方法
     *   resolve：返回一个指定结果的成功的promise
     *   reject：返回一个指定的reason的失败的promise
     *   all：返回一个promise，只有当所有promise都成功时才算成功，否则失败
     *   race：返回一个promise，其结果由第一个完成的promise决定
     */
    Promise.resolve = function (value) {
      //返回一个成功/失败的promise
      return new Promise((resolve , reject) => {
        // value是promise
        if (value instanceof Promise) { //使用value的结果作为当前promise结果
          value.then(resolve , reject)
        } else {
          // value不是promise
          resolve(value)
        }
      })
    }
    Promise.reject = function (reason) {
      // 返回一个失败的promise
      return new Promise((resolve , reject) => {
        reject(reason)
      })
    }
    Promise.all = function (promises) {
      //用来保存  所有成功value的数组
      const values = new Array(promises.length)
      //用来保存成功promise的数量
      let resolveCount = 0
      //返回一个新的promise  
      return new Promise((resolve , reject) => {
        //遍历获取每个promise结果
        promises.forEach((p , index) => {
          Promise.resolve(p).then(
            value => {
              resolveCount++
              //p成功，将成功的value保存到values中
              values[index] = value
              //如果全部成功，将return的promise改为成功
              if (resolveCount === promises.length) {
                resolve(values)
              }
            },
            reason => { //只要有一个失败了，所有都失败
              reject(reason)
            }
          )
        })
      })
    }
    Promise.race = function (promises) {
      //返回一个新的promise
      return new Promise((resolve, reject) => {
        //遍历获取每个promise结果
        promises.forEach((p , index) => {
          Promise.resolve(p).then(
            value => { //一旦有成功的，将return变为成功
              resolve(value)
            },
            reason => { //只要有一个失败了，所有都失败
              reject(reason)
            }
          )
        })
      })
    }
    /**
     * 返回一个promise对象，在指定的时间后确定结果
     */
    Promise.resolveDelay = function (value, time) {
       //返回一个成功/失败的promise
       return new Promise((resolve , reject) => {
        setTimeout(() => {
          // value是promise
          if (value instanceof Promise) { //使用value的结果作为当前promise结果
            value.then(resolve , reject)
          } else {
            // value不是promise
            resolve(value)
          }
        },time)
      })
    }
    /**
     * 返回一个promise对象，在指定的时间之后失败
     */
    Promise.rejectDelay = function (reason, time) {
       // 返回一个失败的promise
       return new Promise((resolve , reject) => {
        setTimeout(() => {
          reject(reason)
        })
      })
    }
    //向外暴露promise函数
    window.Promise = Promise
  })(window)
  