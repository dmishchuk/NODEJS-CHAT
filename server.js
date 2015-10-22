var http = require('http');
var express = require('express.io');
var app = express();
var routes = require('./routes/index');
var passportRoutes = require('./routes/passportAction');
var server = http.createServer(app);
var winston = require('winston');
var passportAuth = require('./vk-auth');
var cookieParser = require('cookie-parser');
var session = require('express-session');
app.use(cookieParser());
app.use(session({
    secret: 'secret'
}));
app.use(express.bodyParser());
winston.add(winston.transports.File, { filename: 'log-info.log' });
winston.remove(winston.transports.Console);
var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.File)({
            name: 'info-file',
            filename: 'log-info.log',
            level: 'info'
        })
    ]
});
app.use('/', routes);
app.use('/', passportRoutes);
//app.use('/', ioRoutes);
var fileuploadRoute = require('./routes');

server.listen(1000, function () {
    console.log('Server listening at port 1000');
});

app.use(express.static(__dirname + '/public'));
winston.log('info', 'Hello distributed log files!');
winston.info('Hello again distributed logs');
require('./routes/ioConnection')(server);

module.exports = function (app) {};