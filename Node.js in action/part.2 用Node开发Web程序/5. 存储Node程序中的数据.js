本章内容
1. 内存和文件系统数据存储
2. 传统的关系型数据库存储
3. 非关系型数据库存储

存储机制取决的5个因素：
1. 存储什么数据
2. 为了保证性能，要有多快的数据读取和写入速度
3. 有多少数据
4. 要怎么查询数据
5. 数据要保存多久，对可靠性有什么要求

5.1 无服务器的数据存储
a. 内存存储 —— 变量保存
b. 文件存储 —— 快捷又容易，但是并发修改，不好处理

5.2 关系型数据库管理系统

a. mySQL
    node-mysql 模块

    我看还有第二版的，https://github.com/sidorares/node-mysql2

    // get the client
    var mysql = require('mysql2');

    // create the connection to database
    var connection = mysql.createConnection({host:'localhost', user: 'root', database: 'test'});

    // 建表
    db.query(
      "CREATE TABLE IF NOT EXISTS work (" 
      + "id INT(10) NOT NULL AUTO_INCREMENT, " 
      + "hours DECIMAL(5,2) DEFAULT 0, " 
      + "date DATE, " 
      + "archived INT(1) DEFAULT 0, " 
      + "description LONGTEXT,"
      + "PRIMARY KEY(id))",
      function(err) { 
        if (err) throw err;
        console.log('Server started...');
        server.listen(3000, '127.0.0.1'); 
      }
    );

    // simple query
    connection.query('SELECT * FROM `table` WHERE `name` = "Page" AND `age` > 45', function (err, results, fields) {
      console.log(results); // results contains rows returned by server
      console.log(fields); // fields contains extra meta data about results, if available
    });

    // with placeholder （占位符）
    connection.query('SELECT * FROM `table` WHERE `name` = ? AND `age` > ?', ['Page', 45], function (err, results) {
      console.log(results);
    });

b. postgreSQL
    支持递归查询和很多特殊的数据类型

    听着像是比mysql吊一些

    http://www.ruanyifeng.com/blog/2013/12/getting_started_with_postgresql.html

    https://github.com/brianc/node-postgres

5.3 NOSQL 数据库
    no sql 或 not only sql

    很多nosql数据库把性能放在了第一位，对于实时分析或消息传递而言，nosql数据库可能是更好的选择。

    个人理解：毕竟是直接取出来一个对象

a. redis 
    非常适合处理那些不需要长期访问的简单数据存储，比如短信和游戏中的数据

    把数据存储在ram中，并在磁盘中记录数据的变化。

    这样做的缺点是存储空间有限，但好处是数据操作非常快

    如果redis服务器崩溃了，ram中内容丢失，可以用磁盘中的日志恢复数据

    http://try.redis.io/

    https://github.com/NodeRedis/node_redis

    https://github.com/redis/hiredis-node C的模块 更高的性能保障，显著提高redis性能

    哈希表的概念，感觉像是对象 key、value获取

    链表的概念，感觉就像是数组

    信道什么的就真心不懂了

b. Mongodb
    15年底、16年初，处理公司API doc的平台上，玩过。

    文档可以直接看这里 https://github.com/justinyhuang/the-little-mongodb-book-cn/blob/master/mongodb.md

    a. 一个数据库可以有若干‘集合’（collection），或者一个也没有。集合和传统概念中的‘表’有着足够多的共同点，所以您大可认为这两者是一样的东西。（类似对象集合 作为一个数据库）
    b. 集合由若干‘文档’（document）组成，也可以为空。类似的，可以认为这里的文档就是‘行’。（备注：类似一个对象）
    c. 文档又由一个或者更多个‘域’（field）组成，您猜的没错，域就像是’列’ （备注：类似属性）。
    d. ‘索引’（index）在MongoDB中的意义就如同索引在RDBMS中一样。‘游标’（cursor）和以上5个概念不同，它很重要但是却常常被忽略，有鉴于此我认为应该进行专门讨论。关于游标有一点很重要，就是每当向MongoDB索要数据时，它总是返回一个游标。基于游标我们可以作诸如计数或是直接跳过之类的操作，而不需要真正去读数据。

    https://github.com/mongodb/node-mongodb-native

    https://github.com/Automattic/mongoose 在mongodb之上做了封装
        schema层次
        中间件
        数据校验
        等功能

整理：
    1. 本章主体是做相关介绍
    2. 最主要是看自己的能力，以及该数据库的优势是否在这个场景下最合适。这就好比技术选型
    3. 有需要其实也可以这个存储用mysql、那个存储用redis、另一个存储用mongodb、还有的放localStorage、放变量存储、放文件存储，anywhere，取决于能力和想象力
