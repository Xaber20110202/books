核心：事件驱动、非阻塞I/O模型、轻量、高效
其他优点：前后端公用同一份代码、NoSQL数据库天作之合

nginx也是采用异步和事件触发方式的程序

DIRT程序（数据密集型实时程序）。设计目标是保证响应能力

封装了一些网络和文件I/O的核心模块，包括用于HTTP、TLS、HTTPS、POSIX、数据报（UDP）和NET（TCP）的模块。

第三方模块在这些基础上做更高层抽象

Hello World

const http = require('http');
const server = http.createServer();
server.on('request', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    res.end('Hello World');
});
server.listen(3000);

流
require('fs').createReadStream('./1. 欢迎进入Node.js世界.js').pipe(process.stdout);

Node 也只能解决特定的问题，为我们开创新的可能性，当然不是无所不能。