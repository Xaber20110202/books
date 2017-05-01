本章内容：
1. 构建一个Connect程序
2. Connect中间件的工作机制
3. 为什么中间件的顺序很重要
4. 挂载中间件和服务器
5. 创建可配置的中间件
6. 使用错误处理中间件

发现connect其实和express应该是同一个出处，这么看起来，koa的中间件，也几乎类似。

require('connect')
    .use((req, res, next) => {
        console.log(req.method, req.url);
        next();
    })
    .use((req, res, next) => {
        res.setHeader('Content-Type', 'text/plain');
        res.end('hello world');
    })
    .listen(3000);

6.3 为什么中间件的顺序很重要
    意味着先处理啊

    1. 忽略next() 就不会走下一个中间件
    2. 按照有利的方式使用强大的中间件顺序特性，其实类似于 trasfrom-stream，中间可以做各种处理
    3. 于是你就可以做认证啊、删除数据啊什么都能做

6.4 挂载中间件和服务器
    1. .use方法第一个参数可以是 url 前缀，这样，只会针对这个路径的url调用中间件服务
    2. 所谓挂载，就好比 访问 /admin/foo 进入相应方法处理，但是相应方法，只需要管req.url === '/foo' 即可，不需要关心'admin'

6.5 创建可配置的中间件
    没啥好说的，一个函数return 另一个函数即可

    router.js
        var parse = require('url').parse;
        module.exports = function route(obj) {
          return function(req, res, next){
            if (!obj[req.method]) {
              next();
              return;
            }
            var routes = obj[req.method];
            var url = parse(req.url);
            var paths = Object.keys(routes);

            for (var i = 0; i < paths.length; i++) {
              var path = paths[i];
              var fn = routes[path];
              path = path
                .replace(/\//g, '\\/')
                .replace(/:(\w+)/g, '([^\\/]+)');
              var re = new RegExp('^' + path + '$');
              var captures = url.pathname.match(re);
              if (captures) {
                var args = [req, res].concat(captures.slice(1));
                fn.apply(null, args);
                return;
              }
            }
            next();
          }
        };

    rewrite.js
        基于url中的标题，查到标题对应的id，然后查找id对应的文章，通过中间件实现，挺6

6.6 错误处理中间件
    a. connect 默认错误处理 —— 500 Internal Server Error
    b. 错误处理中间件，第一个参数是error
    c. 可以根据线上／线下环境，进行各种不同处理
    d. 多个错误中间件组件的整合使用

    const api = connect()
        .use(users)
        .use(pets)
        .use(errorHandler); // 处理 users、pets 等错误

    const app = connect()
        .use(hello)
        .use('api', api)
        .use(errorPage) // 处理hello 错误
        .listen(3000);


