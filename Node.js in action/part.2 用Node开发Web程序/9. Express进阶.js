本章内容：
1. 实现认证
2. URL路由
3. 创建REST API
4. 处理错误

9.1 认证用户

    1. 密码加密 bcrypt 模块 
        https://github.com/kelektiv/node.bcrypt.js

        专门用来对密码做哈希处理，让破解变慢，从而有效对抗暴力攻击

        var bcrypt = require('bcrypt');
        const saltRounds = 10;
        const myPlaintextPassword = 's0/\/\P4$$w0rD';
        const someOtherPlaintextPassword = 'not_bacon';

        // 类似于生成一个key
        bcrypt.genSalt(saltRounds, function(err, salt) {
            // 然后进行hash
            bcrypt.hash(myPlaintextPassword, salt, function(err, hash) {
                // Store hash in your password DB.
            });
        });

        // 判断密码
        // Load hash from your password DB.
        bcrypt.compare(myPlaintextPassword, hash, function(err, res) {
            // res == true
        });
        bcrypt.compare(someOtherPlaintextPassword, hash, function(err, res) {
            // res == false
        });


    2. 脚手架 express -e -s shoutbox  
        -e 代表使用ejs模版
        -s 代表启用会话的支持

    3. PRG 模式
        post／redirect／get（PRG）模式是常用的web程序设计模式，这种模式下，用户请求表单，用http post提交表单，然后用户被重定向到另外一个web页面。

        具体重定向到哪里取决于表单数据是否有效，如果表单数据无效，程序会让用户回到表单界面，如果有效，则会到新的页面

        PRG模式主要是为了防止表单的重复提交

    4. 验证相关信息展现（例如登录、注册的提醒、错误信息展现）
        当用户重定向后，res.locals中内容会被重制，因此，可以把发给用户的信息存储到 会话session里面

        a. 将信息存储在 session 中
        b. 用户跳转了，就是一个新的请求
        c. 构建的一个中间件，会做这块处理，专门提取session里面这块信息，并将信息存储进 res.locals里面
        d. 以此，达到了 夸请求 共享处理数据的目的
        e. 最后，在模版中，通过展现信息之后，调用 res.locals 传进来的，removeMessage 移除session内的信息

    5. 登录的user 会话存储 （类似验证相关信息展现，还是 session 和 res.locals 的结合）

        a. 登录时，首先取数据库，取到了，将uid 放到session里面，页面跳转首页
        b. 经过 user 中间件，通过uid 获取数据库 user 信息，放到 res.locals 内
        c. 每个页面，模版层，menu.ejs 的公共组件，都能拿到 user 数据进行展现

9.2 先进的路由技术
    用特定路由（route-specific）的中间件校验用户提交的内容

    之前的路由：
        app.post('/post', entries.submit);

    改造后的中间件校验的路由：
        app.post(
            '/post',
            validate.required('entry[title]'), // title 必须
            validate.lengthAbove('entry[title]', 4) // title 长度
            entries.submit
        );

        这些校验当然也可以通过接口内部进行判断处理，但是这样会把逻辑绑死在这个表单上
        而大多数情况下，校验逻辑都能提炼到可重用的组件中，让开发更容易、更快、更具声明性

        而中间件里面具体怎么处理，如何跳转，都是中间件可以提前做掉的事情

    实现分页：
        其实和校验中间件类似，提前取数据库，定义好中间的 req 的一些变量，传递给下一层

        app.get('/', page(Entry.count, 5), entries.list);

    路由参数：
        一般参数使用 url 参数 ?page=1 这样的形式，不过我们也可以将请求路径定义为 /:page 这样的形式

        :page 这就叫路由参数

        req.query.page 只能获取 url 参数 ?page=1 这样的内容

        req.param() —— 是什么
            类似于PHP的关联数组，可以用它检查查询字符串、路由和请求主体。 
            ?page=1、/:page 中值为1的 /1，post请求提交的 JSON数据 {"page":1} 在req.param 中获取的是一样的

        另外，如果想让 /15 和 / 都是同样的有效路径，可以使用 /:page? 这样的方式

        这样page 也会取默认值

9.3 创建一个公开的REST API

9.4 错误处理

整理：
    1. 重点内容 res.locals 与 session 的结合使用
    2. 路由中间件的使用 —— 提前校验、封装校验中间件
    3. 路由参数 /:param、 /:param? 和 req.param方法
    4. 



