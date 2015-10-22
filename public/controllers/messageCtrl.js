angular.module('myChat').controller('MessageController', function ($scope, Data, $timeout, $upload, socket) {
    var messages = $scope.messages = [];
    var images = $scope.images = [];
    var users = $scope.users = [];
    var rooms = $scope.rooms = [];
    $scope.word = /^\s*\w*\s*$/;
    $scope.thatUser = '';
    $scope.selectedRoom = 'All';
    $scope.newTalkRoom = '';
    $scope.newRoomInputPlaceholder = 'Add chat room..';
    $scope.username = Data.username;
    socket.emit('get users');
    socket.emit('get history', 'All');
    socket.emit('get rooms');
    if(Data.username === '' || Data.username === undefined) {
        document.location.href = "/#/";
    }

    $scope.selectRoom = function (room) {
        $scope.selectedRoom = room;
        socket.emit('get history', room);
    };

    $scope.addNewTalkRoom = function () {
        if ($scope.newTalkRoom.length > 2 && $scope.word.test($scope.newTalkRoom)) {
            socket.emit('add room', $scope.newTalkRoom);
            $scope.newRoomInputPlaceholder = 'Add chat room..';
            socket.emit('get history', 'All');
        } else {
            $scope.newRoomInputPlaceholder = 'Wrong name, try again..';
        }
        $scope.newTalkRoom = '';
    };

    $scope.logout = function () {
        socket.emit('logout', window.localStorage['token']);
        delete window.localStorage['token'];
        delete window.localStorage['username'];
    };

    $scope.addMessage = function (expr) {
        if(expr !== '' && expr !== undefined) {
            var tempMessage = {
                'user': $scope.username,
                'message': expr,
                'type': 'text',
                'current': 'this',
                'room': $scope.selectedRoom
            };
            messages.push(tempMessage);
            var letter = {
                'mes': expr,
                'user': Data.username,
                'room': $scope.selectedRoom
            };
            socket.emit('new message', letter);
        }
        $scope.mes = '';
    };

    $scope.addMessageByKey = function (event, message) {
        if(event.which === 13) {
            $scope.addMessage(message);
        }
    };

    $scope.addImage = function ($files) {
        $scope.upload = $upload.upload({
            url: '/fileupload',
            file: $files[0]
        }).success(function (data, status, headers, config) {
            socket.emit('file loading', {
                'username': Data.username,
                'room': $scope.selectedRoom
            });
        });
    };

    socket.on('loading successful', function (data) {
        var url = document.URL;
        url = url.split('#')[0];
        url = url + data.fileSource;
        var tempStorage = {
            'user': data.user,
            'type': 'image',
            'im': url,
            'room': data.room
        };
        if(data.user === Data.username) {
            tempStorage['current'] = 'this';
        } else {
            tempStorage['current'] = 'that';
        }
        $timeout(function () {
            messages.push(tempStorage);
        })
    });

    socket.on('successful pass validation', function (data) {
//        Data.username = data.user;
        console.log('success');
    });

    socket.on('failed pass validation', function () {
        console.log('fail');
//        $scope.passPlaceholder = 'Incorrect password';
    });

    socket.on('username online', function (data) {
        $timeout(function () {
            $scope.users.push(data);
        });
    });

    socket.on('username offline', function (data) {
        $timeout(function () {
            for (var i in $scope.users) {
                if($scope.users[i] === data) {
                    $scope.users.splice(i,1);
                }
            }
        })
    });

    socket.on('message send', function (thatMessage) {
        $timeout(function () {
            messages.push(thatMessage);
        })
    });

    socket.on('catch all history', function (historyList) {
        while (messages.length > 0) {
            messages.pop();
        }
        $timeout(function () {
            historyList.forEach(function (element) {
                if (element['user'] === $scope.username) {
                    element['current'] = 'this';
                } else {
                    element['current'] = 'that';
                }
                messages.push(element);
            });
        })
    });

    socket.on('reget history', function () {
        socket.emit('get rooms');
    });

    socket.on('provide users', function (names) {
        $timeout(function () {
            $scope.users = [];
            for(var i in names){
                if (names[i] !== Data.username) {
                    $scope.users.push(names[i]);
                }
            }
        });
    });

    socket.on('provide rooms', function (thisRooms) {
        while (rooms.length > 0) {
            rooms.pop();
        }
        thisRooms.forEach(function (element) {
            rooms.push({
                'name': element,
                'checked': false
            });
        });
        rooms.forEach(function (element) {
            if (element['name'] === 'All') {
                element['checked'] = true;
            }
        });
    });

});