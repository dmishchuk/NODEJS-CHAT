module.exports = function (server) {
    var io = require('socket.io')(server);
    var fs = require('fs');
    var Buffer = require('buffer/').Buffer;
    var jf = require('jsonfile');
    var users = [];
    var username = {};
    var addedUser;
    var history = [
        {
            'room': 'All',
            'list': []
        }
    ];
    var passportAuth = require('../vk-auth');
    var passFile = 'secretInfo.json';
    var historyPassFile = 'hstr.json';
    var randtoken = require('rand-token');
    jf.readFile(historyPassFile, function(err, arr) {
        if (arr[0]['room'] === 'All') {
            history = arr;
        }
    });
    var routes = require('../routes/index');
    require('../routes/passportAction');

    io.on('connection', function (socket) {

        socket.on('token exist', function (data) {
            var exist = false;
            for(var i in username)
            {
                if(i === data['token']) {
                    if(username[i] = data['username']) {
                        users.push(username[i]);
                        exist = true;

                        socket.emit('user exist true', {
                            'user': username[i],
                            'token': i
                        });
                        socket.emit('successful login');
                        socket.broadcast.emit('username online', username[i]);
                    }
                }
            }
            if(!exist) {
                socket.emit('user exist false');
            }
        });

        socket.on('logout', function (logoutToken) {
            for(var i in username) {
                if(i === logoutToken) {
                    for(k in users) {
                        if(users[k] === username[i]) {
                            users.splice(k,1);
                        }
                    }
                    socket.broadcast.emit('provide users', users);
                    delete username[i];
                }
            }
        });

        socket.on('vk-pressed', function () {
            function temp () {
                var vkName = passportAuth.getVkName();
                if(vkName !== ''){
                    socket.emit('vk-successful', vkName);
                }
            }
            setTimeout(temp, 1000);
        });
        var fileuploadRoute = require('../routes');
        socket.on('login entered', function (dataObj) {
            var login = dataObj['user'];
            if (dataObj['pass'] && dataObj['pass'].length > 4) {
                var enсodePass = new Buffer(dataObj.pass);
                enсodePass = enсodePass.toString('base64');
            } else {
                enсodePass = ''
            }
            var fullArr = [];
            var existFlag = false;
            jf.readFile(passFile, function(err, arr) {
                var secretArr = arr;
                fullArr = arr;
                secretArr.forEach(function (element) {
                    if (element['user'] === dataObj.user) {
                        existFlag = true;
                        if (element['key'] === enсodePass) {
                            var unique = true;
                            for(var i in username) {
                                if(username[i] === login) {
                                    var tempToken = i;
                                    unique = false;
                                }
                            }
                            if(unique) {
                                var token = randtoken.generate(16);
                                username[token] = login;
                                socket.emit('login send', username);
                                socket.emit('successful login');
                                socket.broadcast.emit('username online', login);
                                addedUser = true;
                                socket.username = login;
                                users.push(login);
                            } else {
                                socket.emit('if token valid', tempToken);
                                socket.on('token not valid', function () {
                                    socket.emit('wrong login');
                                });
                                socket.on('token valid', function () {
                                    socket.emit('successful login');
                                    socket.broadcast.emit('username online', login);
                                    addedUser = true;
                                    socket.username = login;
                                    users.push(login);
                                });
                            }
                            socket.emit('provide users', users);
                        } else {
                            socket.emit('wrong login');
                        }
                    }
                });
            });

            setTimeout(function () {
                if (!existFlag) {
                    var tempUserInfo = {
                        'user': login,
                        'key': enсodePass
                    };
                    fullArr.push(tempUserInfo);
                    jf.writeFile(passFile, fullArr, function(err) {
                        if (err) {

                        } else {
                            socket.emit("new user added", login);
                        }
                    });
                }
            }, 1000);

        });

        socket.on('file loading', function (Obj) {
            var imMessage = {
                'user': Obj.username,
                'fileSource': fileuploadRoute.getFilepath(),
                'room': Obj.room
            };
            history.forEach(function (element) {
                if (element['room'] === Obj.room) {
                    element['list'].push({
                        'user': Obj.username,
                        'type': 'image',
                        'im': imMessage.fileSource,
                        'room': Obj.room
                    });
                }
            });
            socket.emit('loading successful', imMessage);
            socket.broadcast.emit('loading successful', imMessage);
        });

        socket.on('new message', function (data) {
            history.forEach(function (element) {
                if (element['room'] === data['room']) {
                    element['list'].push({
                        message: data['mes'],
                        user: data['user'],
                        type: 'text',
                        room: data['room'],
                        current: 'that'
                    });
                }
            });
            socket.broadcast.emit('message send', {
                room: data['room'],
                message: data['mes'],
                user: data['user'],
                type: 'text',
                current: 'that'
            });
            var str = JSON.stringify(history);
            var obj = JSON.parse(str);
            fs.writeFileSync(historyPassFile, JSON.stringify(history), encoding='utf8');
        });

        socket.on('get users', function () {
            socket.emit('provide users', users);
        });

        socket.on('add room', function (room) {
            var flag = false;
            history.forEach(function (el) {
                if (el['room'] === room) {
                    flag = true;
                }
            });
            if (!flag) {
                history.push({
                    'room': room,
                    'list': []
                })
            }

            jf.writeFile(historyPassFile, history, function(err) {
                if (err) {
                }
            });
            socket.emit('reget history');
            socket.broadcast.emit('reget history');
        });

        socket.on('get history', function (room) {
            history.forEach(function (element) {
                if (element['room'] === room) {
                    socket.emit('catch all history', element['list']);
                }
            });
        });

        socket.on('get rooms', function () {
            var tempRoomsArr = [];
            history.forEach(function (element) {
                tempRoomsArr.push(element['room']);
            });
            socket.emit('provide rooms', tempRoomsArr);
        });

        socket.on('disconnect', function () {
            if(socket.username !== undefined){
                socket.broadcast.emit('username offline', socket.username);
            }
            for (var i in users) {
                if(users[i] === socket.username){
                    users.splice(i,1);
                }
            }
        });

    });
};


