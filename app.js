var createError = require('http-errors');
var express = require('express');
const mongoose = require('mongoose');
var bodyParser = require('body-parser');
var path = require('path');
require('dotenv').config({ path: __dirname + '/.env' });
var app = express();
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
    next();
});

global.appPath = __dirname;
global.constants = require(global.appPath + '/config/constants');

var apiRouter = require('./routes/apiRoutes');
var adminRouter = require('./routes/adminRoutes');
var port = normalizePort(process.env.PORT || '4078');
app.set('port', port);

var server = require('http').createServer(app);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function InterceptorForAllResponse(req, res, next) {
    var oldSend = res.send;
    res.send = function (data) {
        // arguments[0] (or `data`) contains the response body
        oldSend.apply(res, arguments);
    };
    next();
}

app.use(InterceptorForAllResponse);
app.use('/api', apiRouter); // API Routes
app.use('/admin', adminRouter); // ADMIN Routes
app.get("/", (req, res) => {
  res.send("Server running 🚀")
})

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
    var port = parseInt(val, 10);
    if (isNaN(port)) {
        // named pipe
        return val;
    }
    if (port >= 0) {
        // port number
        return port;
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

    // handle specific listen errors with friendly messages
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

// MongoDB Connection
async function connectToMongoDB() {
    if (mongoose.connection.readyState !== 1) {
        // Avoid multiple connections
        try {
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('✅ Connected to MongoDB Successfully');
        } catch (err) {
            console.error('❌ MongoDB connection error:', err);
            process.exit(1);
        }
    }
}

// Start Server only once MongoDB is connected
(async () => {
    await connectToMongoDB();
    app.listen(process.env.PORT || 3000, () =>
        console.log(`🚀 Server is running on port ${process.env.PORT || 3000}`)
    );
})();

module.exports = app;
