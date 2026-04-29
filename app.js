require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
const mongoose = require('mongoose');
var bodyParser = require('body-parser');

var app = express();
var server = null;

app.disable('x-powered-by');
app.disable('Server');

app.use(
    bodyParser.json({
        limit: '50mb',
    })
);

app.use(
    bodyParser.urlencoded({
        limit: '50mb',
        extended: true,
    })
);

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET,PUT,POST,DELETE,PATCH,OPTIONS,HEAD'
    );
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type,access-token,x-http-method-override,x-access-token,authorization'
    );
    res.setHeader('Access-Control-Expose-Headers', 'Content-Type,expire');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    next();
});

global.appPath = __dirname;
global.constants = require(global.appPath + '/config/constants');

var apiRouter = require('./routes/apiRoutes');
var adminRouter = require('./routes/adminRoutes');
var port = normalizePort(process.env.PORT || '4078');

app.set('port', port);

function InterceptorForAllResponse(req, res, next) {
    var oldSend = res.send;
    res.send = function () {
        oldSend.apply(res, arguments);
    };
    next();
}

app.use(InterceptorForAllResponse);
app.use('/api', apiRouter);
app.use('/admin', adminRouter);
app.get('/', function (req, res) {
    res.send('Server running');
});

app.use(function (req, res, next) {
    next(createError(404));
});
app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    console.log(err);
    res.status(err.status || 500).json('error');
});

function normalizePort(val) {
    var parsedPort = parseInt(val, 10);
    if (isNaN(parsedPort)) {
        return val;
    }
    if (parsedPort >= 0) {
        return parsedPort;
    }
    return false;
}

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    console.log('Listening on', bind);
}

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

async function connectToMongoDB() {
    if (mongoose.connection.readyState !== 1) {
        try {
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('Connected to MongoDB Successfully');
        } catch (err) {
            console.error('MongoDB connection error:', err);
            process.exit(1);
        }
    }
}

async function startServer() {
    await connectToMongoDB();
    server = require('http').createServer(app);
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);
}

if (require.main === module) {
    startServer().catch((err) => {
        console.error('Server startup failed:', err);
        process.exit(1);
    });
}

module.exports = app;
