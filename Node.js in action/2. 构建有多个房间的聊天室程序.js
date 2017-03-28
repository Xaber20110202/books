通过HTTP提供文件时，通常不能只是发送文件中的内容，还应该有所发送文件的类型。

这时候需要 mime 库 https://github.com/broofa/node-mime

聊天用webSocket  使用socket.io库  https://github.com/socketio/socket.io

package.json 包依赖
    npm install xxx --save
    npm install xxx --save-dev（save和dev之间只有一个-，需要注意）

---------------------------------------------------
使用HTTP 提供静态文件

const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime');

// 用来做文件内容缓存
// 书中描述，读去内容RAM比访问文件系统快。因而好奇了把，看了下koa-static https://github.com/koajs/static
// 用的是 koa-send 模块 https://github.com/koajs/send
// 而 koa-send 用的是 流，没用缓存代理的模式。
const cache = {};

const send404 = (res) => {
    res.writeHead(404, {
        'Content-Type': 'Not Found'
    });
    res.end();
};

const sendFile = (res, filePath, content) => {
    res.writeHead(200, {
        // @@@ path.basename() 方法返回一个 path 的最后一部分，类似于 Unix 中的 basename 命令
        // see http://nodejs.cn/api/path.html#path_path_basename_path_ext
        
        // path.basename('/foo/bar/baz/asdf/quux.html')
        // 返回: 'quux.html'
        // path.basename('/foo/bar/baz/asdf/quux.html', '.html')
        // 返回: 'quux'
        
        //  path.basename 取了下ext后缀名
        //  mime 这个库 .lookup 做了下正则匹配
        //  而mime 这个库 调用了的又是 这个 mime-db 库
        //  https://github.com/jshttp/mime-db
        //  https://github.com/jshttp/mime-db/blob/master/db.json
        'Content-Type': mime.lookup(path.basename(filePath));
    });
    res.end(content);
};

// 书里这块依赖注入写的倒是不错的，基本通过传参来处理，减少代码耦合
const serveStatic = (res, cache, absPath) => {
    if (cache[absPath]) {
        sendFile(res, absPath, cache[absPath]);
    } else {
        fs.exists(absPath, (exists) => {
            if (exists) {
                fs.readFile(absPath, (err, data) => {
                    if (err) {
                        send404(res);
                    } else {
                        cache[absPath] = data;
                        sendFile(res, absPath, data);
                    }
                });
            } else {
                send404(res);
            }
        });
    }
};

const server = http.createServer((req, res) => {
    let filePath = false;

    // 相当于把public作为了静态文件根目录
    if (req.url === '/') {
        filePath = 'public/index.html';

    } else {
        filePath = 'public/' + request.url;
    }
    serveStatic(res, cache, './' + filePath);
});

server.listen(80);

---------------------------------------------------
浏览器层UI层面代码略


---------------------------------------------------
Socket.io 实现聊天
TODO


