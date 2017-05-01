本章内容
1. 用模块组织代码
2. 编码规范
3. 回调处理一次性完结的事件
4. 事件发射器处理重复性事件
5. 串行、并行的流程控制
6. 流程控制工具

3.1 Node 功能的组织和重用
a. node 模块还解决了 PHP、ruby的命名冲突问题...
b. module 和 module.exports
c. 【以同步的模式引入，所以在文件顶部引入即可。千万不要丫的在处理IO的函数中引入，这就好像在频繁ajax中获取dom（实际上可以在函数外面用变量保存起来）】
d. 不要用 `exports = aaa`， 毕竟变量被覆盖了。module.exports 没变，最后被推出的是 module.exports
e. 使用node_modules —— 先找当前目录同级同名文件，没找到则在当前目录node_modules下找，再没有再一层层向上回溯
f. package.json中的 main 属性可以改变模块 index.js 的设定
g. 模块的多次引用，在内存中是同一份，引用值会更改；同理，就把一整个node应用，堪称一个页面，里面变量、值会相互影响；要尽量做到解耦

3.2 异步编程技术
a. 提前return 尽早返回
b. 一层层嵌套，现在有了 promise、co、async/await。了解了，这类可以略过了
c. 事件发射器 const channel = new reuqire('events').EventEmitter();
d. 监听数量，channel.setMaxListeners(50)，默认是10个监听
e. 可以通过 事件／观察者模式 监听错误，发出错误
f. const util = require('util'); util.inherits(Watchers, event.EventEmitter)

3.3 异步逻辑的顺序化
a. 模块：nimble（查了下，和async同一个作者我X，看来是基于nimble搞出了async）、step、seq、async等等等等
b. 模块太多，略；可以见 ES6基础系列 —— 理解Generator及其应用场景 http://xaber.co/2017/01/25/ES6%E5%9F%BA%E7%A1%80%E7%B3%BB%E5%88%97-%E2%80%94%E2%80%94-%E7%90%86%E8%A7%A3generator%E5%8F%8A%E5%85%B6%E5%BA%94%E7%94%A8%E5%9C%BA%E6%99%AF/

这一章主题内容是常谈的 node模块、异步处理








