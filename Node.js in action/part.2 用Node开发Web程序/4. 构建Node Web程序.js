本章内容
1. 用Node的API处理HTTP请求
2. 构建一个RESTful Web服务
3. 提供静态文件服务
4. 接受️用户在表单中输入的数据
5. 用HTTPS加强程序的安全性

Node http模块非常简单，高层“含糖”API留给了Express、Connect这样的第三方框架

4.1 Http服务器的基础知识
分层：
1. Node 核心：querystring、http、net
    核心API轻量、底层。想法、语法糖和具体细节交给社区模块实现

2. 社区模块：node-formidable、express、mongoose 等
    是node最兴盛的部分

3. 应用逻辑：http.createServer()、app.use()
    内容：路由处理、目录结构、业务算法
    由业务复杂度决定

注意点：
1. node不会在回调函数被触发之前开始对请求体的解析，来了再处理
2. 必须手动调用 res.end() 结束响应

设定请求头、相应头：
res.setHeader(filed, value)、res.getHeader(filed, value)、res.removeHeader(filed) —— 必须在res.write()、res.end()之前

设定状态码：
res.statusCOde = 302 —— 也必须在res.write()、res.end()之前

Node的策略是提供小而强的网络API，不去根rails或Django之类的框架竞争，而是作为类似框架构建基础的巨大平台。因而没有cookie等内建模块

4.2 构建Restful web服务

CRUD

req.method 区分 POST、GET、DELETE、PUT

req.setEncoding('utf8') 将buffer数据处理成文本字符串

设定 Content-Length 的值应该是字节长度，而不是字符长度，并且如果字符串中有多字节字符，两者的长度不一样。Node提供了 Buffer.byteLength() 方法

url模块
    require('url').parse
        https://nodejs.org/api/url.html#url_url_strings_and_url_objects

4.3 提供静态文件服务
__dirname 当前文件所在目录

const http = require('http');
const fs = require('fs');
const parse = require('url').parse;
const join = require('path').join;
const root = __dirname;

const server = http.createServer((req, res) => {
    fs.createReadStream(join(root, parse(req.url).pathname)).pipe(res);
});

为避免报错（所有继承了EventEmitter的类都可能会发出error事件）：
const server = http.createServer((req, res) => {
    const stream = fs.createReadStream(join(root, parse(req.url).pathname))
    stream.pipe(res);
    stream.on('error', () => {
        res.statusCode = 500;
        res.end('Internal server error');
    })
});

fs.stat() 先发制人避免错误（提前判断文件是否存在）
fs.stat(path, (err, stat) => {
    if (err) {
        // err.code === 'ENOENT'
    } else {
        // res.setHeader('Content-Length', stat.length);
    }
});

4.4 从表单中接受用户输入

表单提交的 Content-type 通常有两种：
1. application/x-www-form-urlencodeed：这是html表单的默认值
2. multipart/form-data：在表单中含有文件或非ASCII或非二进制数据时使用

querystring模块

用formidable处理上传的文件
    https://github.com/felixge/node-formidable

    var formidable = require('formidable'),
        http = require('http'),
        util = require('util');

    http.createServer(function(req, res) {
      if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
        // parse a file upload
        var form = new formidable.IncomingForm();

        form.parse(req, function(err, fields, files) {
          res.writeHead(200, {'content-type': 'text/plain'});
          res.write('received upload:\n\n');
          res.end(util.inspect({fields: fields, files: files}));
        });

        return;
      }

      // show a file upload form
      res.writeHead(200, {'content-type': 'text/html'});
      res.end(
        '<form action="/upload" enctype="multipart/form-data" method="post">'+
        '<input type="text" name="title"><br>'+
        '<input type="file" name="upload" multiple="multiple"><br>'+
        '<input type="submit" value="Upload">'+
        '</form>'
      );
    }).listen(8080);


4.5 用HTTPS 加强程序的安全性
    私钥： openssl genrsa 1024 > key.pem
    证书： openssl req -x509 -new -key key.pem > key-cert.pem

    var https = require('https');
    var fs = require('fs');

    var options = {
      key: fs.readFileSync('./key.pem'),
      cert: fs.readFileSync('./key-cert.pem')
    };

    https.createServer(options, (req, res) => {
      res.writeHead(200);
      res.end('hello world');
    }).listen(3000);

