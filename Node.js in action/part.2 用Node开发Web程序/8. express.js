本章内容：
1. 开始一个新的Express程序
2. 配置你的程序
3. 创建Express视图
4. 处理文件上传和下载

Express和整个node社区，都致力于做出更小的、模块化程度更高的功能实现，而不是一个整体式框架。

8.1 生成程序骨架
npm install -g express-generator 脚手架
    脚手架也已经升级了 https://github.com/expressjs/generator

    var favicon = require('serve-favicon');
    var logger = require('morgan');
    var cookieParser = require('cookie-parser');
    var bodyParser = require('body-parser');
    var app = express();

    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');


    // uncomment after placing your favicon in /public
    //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));

    相关的中间件，也从express内部抽离了出去，变成了 morgan、cookie-parser等等，具体可以见：
        https://github.com/senchalabs/connect
        都在里面描述了

8.2 配置Express和你的程序
    生产环境可能需要精简的日志和gzip压缩、用什么模版引擎、到哪里找模版等等
    
    Express提供了一个极简的环境驱动配置系统，由环境变量 NODE_ENV 驱动

    UNIX 系统： NODE_ENV=production node app
    windows： set NODE_ENV=production && node app

    NODE_ENV源自express，但是现在很多框架都在用它通知Node程序当前所在环境

    app.configure()
        用来做环境区分和设置，
        app.configure('development', () => {});
        等同于 
        if (process.env.NODE_ENV === 'development') {
            // do something
        }

    app.set()
        配置项

    app.get()
        获取配置项

    app.enable()
        app.set() 的变体／语法糖
        等同于  app.set(setting, true);

    app.disable()
        app.set() 的变体／语法糖
        等同于 app.set(setting, false);


    另外，app.enabled(setting)、app.disabled(setting) 其实就是 app.get(setting) === true 的语法糖

8.3 渲染视图
    res.render('模版路径', '模版数据');

    视图系统配置
        
        改变查找目录
            app.set('views', __dirname + '/views'); // 指定了Express在查找视图时所用的目录。

            __dirname 当前运行的文件所在目录

        默认的模版引擎
            app.set('view engine', 'jade'); // 默认用jade 模版

            但是考虑到多模版共用情况，express 会根据模版文件后缀，匹配使用的模版

            res.render('index', {}); // 不写后缀，默认使用 jade 模版
            res.render('feed.ejs', {}); // 使用ejs 模版

        视图缓存
            view cache 在生产环境下是默认开启的，这样的好处是，不需要每次请求都从硬盘上读取模版。
            带来一个缺点就是，模版的改动只有在程序重启才生效

            相当于就是把模版的字符串放到内存里面去了

    视图查找
        类似 require
            按照 view engine 路径，相对查找
            如果是文件夹路径，找 index.ejs（扩展名根据具体情况）
            扩展名就用默认的，除非有其他指定

    把数据输出到视图中
        res.render('模版路径', '模版数据'); // 没啥好说的

        但是，辅助函数需要描述下，还挺有用

        app.locals() // 传递程序层面的变量

        res.locals() // 传递请求层面的本地变量

8.4 处理表单和文件上传

8.5 创建资源下载




