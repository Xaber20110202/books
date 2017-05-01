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
前端JS 层面

1. chat.js 处理了一个Chat类型， 封装了 socket.io的 message、join、nick事件 emit发送
2. chat_ui.js 中
    a. 监听form表单事件，根据用户输入，通过 processUserInput 发送 message、或join、nameAttempt 事件和消息
    b. 监听 nameResult、joinResult、message、rooms 事件

chat.js
    var Chat = function(socket) {
      this.socket = socket;
    };

    Chat.prototype.sendMessage = function(room, text) {
      var message = {
        room: room,
        text: text
      };
      this.socket.emit('message', message);
    };

    Chat.prototype.changeRoom = function(room) {
      this.socket.emit('join', {
        newRoom: room
      });
    };

    Chat.prototype.processCommand = function(command) {
      var words = command.split(' ');
      var command = words[0]
                    .substring(1, words[0].length)
                    .toLowerCase();
      var message = false;

      switch(command) {
        case 'join':
          words.shift();
          var room = words.join(' ');
          this.changeRoom(room);
          break;
        case 'nick':
          words.shift();
          var name = words.join(' ');
          this.socket.emit('nameAttempt', name);
          break;
        default:
          message = 'Unrecognized command.';
          break;
      };

      return message;
    };

chat_ui.js

    function divEscapedContentElement(message) {
      return $('<div></div>').text(message);
    }

    function divSystemContentElement(message) {
      return $('<div></div>').html('<i>' + message + '</i>');
    }

    function processUserInput(chatApp, socket) {
      var message = $('#send-message').val();
      var systemMessage;

      if (message.charAt(0) == '/') {
        systemMessage = chatApp.processCommand(message);
        if (systemMessage) {
          $('#messages').append(divSystemContentElement(systemMessage));
        }
      } else {
        chatApp.sendMessage($('#room').text(), message);
        $('#messages').append(divEscapedContentElement(message));
        $('#messages').scrollTop($('#messages').prop('scrollHeight'));
      }

      $('#send-message').val('');
    }

    var socket = io.connect();

    $(document).ready(function() {
      var chatApp = new Chat(socket);

      socket.on('nameResult', function(result) {
        var message;

        if (result.success) {
          message = 'You are now known as ' + result.name + '.';
        } else {
          message = result.message;
        }
        $('#messages').append(divSystemContentElement(message));
      });

      socket.on('joinResult', function(result) {
        $('#room').text(result.room);
        $('#messages').append(divSystemContentElement('Room changed.'));
      });

      socket.on('message', function (message) {
        var newElement = $('<div></div>').text(message.text);
        $('#messages').append(newElement);
      });

      socket.on('rooms', function(rooms) {
        $('#room-list').empty();

        for(var room in rooms) {
          room = room.substring(1, room.length);
          if (room != '') {
            $('#room-list').append(divEscapedContentElement(room));
          }
        }

        $('#room-list div').click(function() {
          chatApp.processCommand('/join ' + $(this).text());
          $('#send-message').focus();
        });
      });

      setInterval(function() {
        socket.emit('rooms');
      }, 1000);

      $('#send-message').focus();

      $('#send-form').submit(function() {
        processUserInput(chatApp, socket);
        return false;
      });
    });

---------------------------------------------------
Socket.io 实现聊天

chat_server.js

    var socketio = require('socket.io');
    var io;
    var guestNumber = 1;
    var nickNames = {};
    var namesUsed = [];
    var currentRoom = {};

    exports.listen = function(server) {
      io = socketio.listen(server);
      io.set('log level', 1);
      io.sockets.on('connection', function (socket) {
        console.log(souc)
        // 先分配了用户名称，获取了用户数量id
        guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
        // 先加入一个房间
        joinRoom(socket, 'Lobby');
        // 切换房间发消息
        handleMessageBroadcasting(socket);
        // 改名处理
        handleNameChangeAttempts(socket, nickNames, namesUsed);

        // 加一个房间，离开另一个房间
        handleRoomJoining(socket);

        // 房间总数
        socket.on('rooms', function() {
          socket.emit('rooms', io.sockets.manager.rooms);
        });

        // 这个用户离开
        handleClientDisconnection(socket);
      });
    };

    function assignGuestName(socket, guestNumber, nickNames, namesUsed) {
      var name = 'Guest' + guestNumber;
      nickNames[socket.id] = name;
      socket.emit('nameResult', {
        success: true,
        name: name
      });
      namesUsed.push(name);
      return guestNumber + 1;
    }

    function joinRoom(socket, room) {
      socket.join(room);
      // 当前用户在哪个房间
      currentRoom[socket.id] = room;
      socket.emit('joinResult', {room: room});

      // 房间入人通知
      socket.broadcast.to(room).emit('message', {
        text: nickNames[socket.id] + ' has joined ' + room + '.'
      });

      // 房间已有人通知
      var usersInRoom = io.sockets.clients(room);
      if (usersInRoom.length > 1) {
        var usersInRoomSummary = 'Users currently in ' + room + ': ';
        for (var index in usersInRoom) {
          var userSocketId = usersInRoom[index].id;
          if (userSocketId != socket.id) {
            if (index > 0) {
              usersInRoomSummary += ', ';
            }
            usersInRoomSummary += nickNames[userSocketId];
          }
        }
        usersInRoomSummary += '.';
        socket.emit('message', {text: usersInRoomSummary});
      }
    }

    function handleNameChangeAttempts(socket, nickNames, namesUsed) {
      socket.on('nameAttempt', function(name) {
        if (name.indexOf('Guest') == 0) {
            // 改名是否成功的消息推送
          socket.emit('nameResult', {
            success: false,
            message: 'Names cannot begin with "Guest".'
          });
        } else {
          if (namesUsed.indexOf(name) == -1) {
            var previousName = nickNames[socket.id];
            var previousNameIndex = namesUsed.indexOf(previousName);
            namesUsed.push(name);
            nickNames[socket.id] = name;
            delete namesUsed[previousNameIndex];
            socket.emit('nameResult', {
              success: true,
              name: name
            });
            socket.broadcast.to(currentRoom[socket.id]).emit('message', {
              text: previousName + ' is now known as ' + name + '.'
            });
            // 名字已存在
          } else {
            socket.emit('nameResult', {
              success: false,
              message: 'That name is already in use.'
            });
          }
        }
      });
    }

    function handleMessageBroadcasting(socket) {
      socket.on('message', function (message) {
        socket.broadcast.to(message.room).emit('message', {
          text: nickNames[socket.id] + ': ' + message.text
        });
      });
    }

    function handleRoomJoining(socket) {
      socket.on('join', function(room) {
        socket.leave(currentRoom[socket.id]);
        joinRoom(socket, room.newRoom);
      });
    }

    function handleClientDisconnection(socket) {
      socket.on('disconnect', function() {
        var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
        delete namesUsed[nameIndex];
        delete nickNames[socket.id];
      });
    }


整理：
1. 每个连接，有一个 socket.id 可以用作标示
2. 浏览器端一个 on、接收的node服务端emit的事件消息；服务端的on，监听的也是客户端emit的消息；这个设计还挺有意思的
3. 加入一个房间，只要用 socket.join 方法即可；离开一个房间，用socket.leave；断开连接，则需要服务端监听 disconent事件
4. socket.io 的 broadcast 用来转发相关消息
5. 更多内容，还是需要到实际应用场景下，调研、使用。具体API还是直接见 https://github.com/socketio/socket.io

其他：
1. 防xss 攻击，可以先经过 $('div').text(text) 再进行append处理
