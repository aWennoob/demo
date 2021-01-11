const express = require('express');
const app = express();

app.get('/test', function (request, response) {
    const { name} = request.query;
   
    response.setHeader('Access-Control-Allow-Origin', '*')
    response.send(JSON.stringify(name))
})

app.listen(3000, (err) => {
    if (!err) console.log('服务器搭建成功');
    else console.log(err);
})