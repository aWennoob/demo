const axios=require('axios');
const qs=require('qs')

const instance=axios.create({
    baseURL:'http://localhost:3000',
    timeout:500
})
instance.interceptors.request.use((config)=>{
    NProgress.start()
    if(config.data instanceof Object){
        config.data=qs.stringify(config.data)
    }
    return config;
})
instance.interceptors.response.use(
    response=>{
        NProgress.done()
        return response.data
    },
    error=>{
        NProgress.done()
        alert(error.message)
        return new Promise(()=>{})
    }
)