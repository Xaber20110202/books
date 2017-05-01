本章内容：
1. 解析cookie、请求主体和查询字符串的中间件
2. 实现web程序核心功能的中间件
3. 处理web程序安全的中间件
4. 提供静态文件服务器的中间件

7.1 解析cookie、请求主体和查询字符串的中间件

cookieParser()
    常规cookie --> req.cookies
    签名cookie --> req.signedCookies
    JSON cookie 既可以是签名也可以是非签名的，其实主要就是把上面取的值JSON.parse了一下
    出站cookie --> setHeader('Set-Cookie', xxx) 自己设定，不过Connect 对res.setHeader 多做了一定包装

bodyParser() --> 解析请求主体，放进req.body
    整合了三个小组件 —— json()、urlencodeed()、multipart()

    是根据 content-type 进行区分的

    a. json() 解析JSON数据 针对 application/json
    b. urlencoded() 解析常规的 <FORM> 数据 针对 x-www-form-urlencoded
    c. multipart() 解析 MUILIPART <FORM> 数据，底层调用 formidable 模块，针对 muiltipart/form-data

    如果 bodyParser() 在内存中缓存json 和 x-www-form-urlencoded 请求主体，产生一个大字符串，攻击者可能就会做一个超级大的JSON请求主体，对服务器做拒绝服务攻击

    因此需要limit() 进行控制

limit() 更bodyParser() 联手，防止读取过大的请求
    帮助过滤巨型的请求，不管是不是恶意的

    limit 要放在bodyParser 前面

    一个300000个字符串foo的数组，经过JSON.parse 服务器，就炸了

    connect().use(connect.limit('32kb')) // 可选项：字节数（number）或者 1gb、25mb、50kb等

    // 更大的灵活性，因为 图片／饰品等等，大小需要不同
    // connect.limit() 返回的其实就是一个函数
    var connect = require('connect');

    function type(type, fn) {
      return function(req, res, next){
        var ct = req.headers['content-type'] || '';
        if (0 != ct.indexOf(type)) {
          return next();
        }
        fn(req, res, next);
      }
    }

    var app = connect()
      .use(type('application/x-www-form-urlencoded', connect.limit('64kb')))
      .use(type('application/json', connect.limit('32kb')))
      .use(type('image', connect.limit('2mb')))
      .use(type('video', connect.limit('300mb')))
      .use(connect.bodyParser());

query() --> req.query
    用的是第三方模块 qs https://github.com/ljharb/qs，处理 querystring 更方便

7.2 实现web程序核心功能的中间件

logger()
    灵活的请求日志

    1. 有默认格式
    2. 可以进行格式定制，还可以定义颜色
    3. 日志选项：Stream、immediate、buffer
        a. Stream 可以将proscess.stdout 的日志输出放进放进文件里面
        b. immediate 可以让请求进来就打点，而不是等到请求响应之后
        c. buffer 用来降低往硬盘中写日志的次数

    https://github.com/expressjs/morgan

favicon()
    
    https://www.npmjs.com/package/serve-favicon

    处理 /favicon.icon 请求

    一般来说，最好尽快响应对 favicon 文件的请求，这样程序的其他部分可以忽略它们

    一般放在中间件栈的最顶端

    app.use(connect.favicon(__dirname + 'favicon.icon', {
        'max-age': 1000 // xxxx
    }))

    另外，还可以传递一个maxAge参数，让浏览器把favicon放在内存中缓存多长时间

methodOverride()
    让没有能力的客户端透明地重写 req.method

    表单提交，不支持 put 方法。 表单提交用 post，再加一个 _method 的控件，值设为 put

    app.use(connect.methodOverride()) // req.method  post 变成了 put; req.originalMethod 还是post

vhost()
    在一个服务器上设置多个网站（虚拟主机）

    根据域名，切换不同 connect 服务

    https://github.com/expressjs/vhost

    缺点：崩一个全崩

session()
    管理会话数据

    依赖 cookieParser，需要在其之后调用

    req.session
        本质上是JSON，不能放函数、Date等对象

    会话存储
        connect.session.MemoryStore 是一种简单的内存数据存储，非常适合运行程序测试
        但在开发和生产期间，最好又一个持久化、可扩展的数据存放会话数据

        例如：couchDB、redis、memcached等

        app.use(session({
            store: new RedisStore({
                prefix: 'sid'
            })
        }));

7.3 处理web程序安全的中间件
    
basicAuth() 为保护数据提供了HTTP基本认证
    就好比登录后，才能访问该页面
    
    var connect = require('connect');
    var app = connect();

    var User = {
      authenticate: function(credentials, callback) {
        if (credentials.user == 'tobi'
          && credentials.pass == 'ferret') {
          callback(null, credentials);
        } else {
          callback(new Error('Incorrect credentials.'));
        }
      }
    }

    app.use(connect.basicAuth(function(user, pass, callback){
      User.authenticate({ user: user, pass: pass }, gotUser);

      function gotUser(err, user) {
        if (err) return callback(err);
        callback(null, user);
      }
    }));

    app.listen(3000);

csrf() 实现对跨站请求伪造（CSRF）攻击的防护
    确保每一个请求提交，都是经过当前网站做的提交

errorHandler() 帮你在开发过程中进行调试
    https://github.com/expressjs/errorhandler

    a. 不应该出现在生产环境中
    b. 需要放在最后面

    出错后在网页上可以清楚地看到问题在哪里

7.4 提供静态文件服务器的中间件

static() 将文件系统中给定根目录下的文件返回给客户端
    1. 支持http缓存机制、范围请求等
    2. 有对恶意路径的安全检查，默认不允许访问隐藏文件（文件名以 . 开头）
    3. 根据 content-type 访问到具体静态文件目录
    4. 请求目录时，会默认返回 index.html

    app.use(connect.static('public'));

    还可以用挂载功能

    app.use('app/files', connect.static('public'));

    默认路径是 process.cwd() + 'public'，当然也可以自己定义为 __dirname + '/public'

compress() 压缩响应，很适合跟static() 一起使用
    1. 尽量把这个中间件放在前面，放在static前面，当然，其他res.write、res.end 也是同样的
    2. 会检测客户端可接受的编码，accept-encoding，进行处理返回
    3. 可以使用定制的过滤器函数
        connect().use(connect.compress({
            filter(req, res) {
                return (res.getHeader('Content-Type') || '').match(/json|text|javascript/)
            }
        }))

    4. 设定压缩比率和压缩水平
        详见 zlib https://nodejs.org/api/zlib.html

        level：压缩水平还是压缩速度
         memLevel：是否使用更多内存加快压缩速度

        要怎么用，取决程序和可用的内存资源

directory() 当请求的是目录时，返回那个目录的列表
    提供了目录导航、搜索框、文件图标、和可点击的面包屑导航

    需要配合static() 使用

    app
    .use('/files', connect.directory('public', {
        icons: true,
        hidden: true
    }))
    .use('/files', connect.static('public', {
        hidden: true
    }));

--------------------------------

整理：
    1. 这一章比较核心，基本上把connect各个自带中间件描述完了，而这些中间件，从github来看，就是构成express框架的东西
    2. connect 一般用来作为更高层框架的构件，它的底层方式使得它非常适合做高层框架的基础，express就是这样集成它的
    3. 由此可以看到，node就是基础的基础，啥都没有，connect做了一层封装，处理出各种构件，再由express整合成一个大框架
    4. 其实，koa的内容，和connect、express就基本比较类似了，对理解koa，还是挺有帮助的


