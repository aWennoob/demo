function axios({
    url,
    method = 'get',
    params = {},//query参数
    data = {}//请求体参数
}) {
    let str = '';
    Object.keys(params).forEach(key => {
        str += `&${key}=${params[key]}`
    })
    if (str) {
        str = str.substring(1);
        url = `${url}?${str}`;
    }
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () { 
            const {readyState,status,statusText}=xhr;
            if(readyState!==4) return;
            if(status>=200&&status<300){
                const response={
                    data:JSON.parse(xhr.response),
                    status,
                    statusText
                }
            resolve(response)
            }else{
                reject(new Error('request error status is'+status))
            }
        };
        xhr.open(method, url, true);
        if (method === 'post'||method === 'put') {
            xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8')
            xhr.send(JSON.stringify(data))
        } else {
            xhr.send()
        }

    })
}