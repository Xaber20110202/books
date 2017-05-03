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

8.4 处理表单和文件上传

8.5 创建资源下载




