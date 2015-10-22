angular.module('myChat').controller('LoginController', function ($scope, Data, $timeout, socket, $http) {
    $scope.created = false;
    $scope.loading = false;
    $scope['data'] = {};
    $scope.addedUser = '';
    $scope.placeholder = 'Enter login';
    $scope.passPlaceholder = 'Enter password';
    if(window.localStorage.token !== '' && window.localStorage.token !== undefined) {
        var tempToken = window.localStorage.token;
        var user = window.localStorage.username;
        socket.emit('token exist', {
            'token': tempToken,
            'username': user
        });
    }

    $scope.addLogin = function (expr) {
        if(expr !== '' && expr !== undefined) {
            if ($scope.data.pass !== '' && $scope.data.pass !== undefined && $scope.data.pass.length >= 5) {
                Data.username = expr;
                socket.emit('login entered', {
                    'user': expr,
                    'pass': $scope.data.pass
                });
                /*$http.post('/passupload', {
                    msg: $scope.data.pass,
                    user: expr
                }).
                    success(function(data, status, headers, config) {
//                        Data.username = expr;
//                        socket.emit('login entered', expr);
                    }).
                    error(function(data, status, headers, config) {

                    });*/
            } else {
                $scope['data']['pass'] = '';
                $scope.passPlaceholder = 'Wrong password..';
            }
        }
    };

    $scope.addVkLogin = function (event) {
        $scope.loading = true;
        socket.emit('vk-pressed');
        socket.on('vk-successful', function (login) {
            Data.username = login;
            socket.emit('login entered', {
                'user': login,
                'pass': ''
            });
        });
    };


    socket.on('user exist true', function (data) {
        Data.username = data.user;
        Data.token = data.token;
        window.localStorage['token'] = data.token;
        window.localStorage['username'] = data.user;
    });

    socket.on('user exist false', function () {
        delete window.localStorage['token'];
        delete window.localStorage['username'];
    });

    socket.on('login send', function (login) {
        for(var i in login){
            Data.token = i;
            Data.username = login[i];
        }
        window.localStorage['username'] = Data.username;
        window.localStorage['token'] = Data.token;
    });

    socket.on('successful login', function () {
        document.location.href = '/#/chat';
    });

    socket.on('if token valid', function (data) {
        if (window.localStorage['token'] === data) {
            socket.emit('token valid');
        } else {
            socket.emit("token not valid");
        }
    });

    socket.on('wrong login', function () {
        $timeout( function () {
            $scope.data.login = '';
            $scope.data.pass = '';
            $scope.passPlaceholder = 'Wrong password, try again..';
        })
    });

    socket.on('new user added', function (item) {
        $scope.addedUser = item
        $scope.created = true;
//        console.log(item);
        $scope.data.login = '';
        $scope.data.pass = '';
        $scope.placeholder = 'Enter login';
        $scope.passPlaceholder = 'Enter password';
    })

});