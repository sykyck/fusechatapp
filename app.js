var express = require('express');
var SocketIO = require('socket.io');
var socket = require('./socket');
var http = require('http');
var socketioJwt =require('socketio-jwt');
var fs = require('file-system');
var publicKey = fs.readFileSync('./publicKey.txt', 'utf-8');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var apiRoutes = require('./src/api.routes');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended':'false'}));
app.use(express.static(path.join(__dirname, 'dist')));

let server = http.Server(app);
let port = process.env.PORT || 3030;
let io = new SocketIO(server);

io.use(socketioJwt.authorize({
  secret: publicKey,
  handshake: true
}, function(err) {
  console.log("--------------- Auth error");
  console.log(err);
}));

app.use(function(req, res, next){
   req.io = io;
   next();
});

socket(io);

app.use('/', (req,res)=>{
  res.send('home route hit');
});
app.use('/api', apiRoutes);
app.use('/chat/*', express.static(path.join(__dirname, 'dist')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

server.listen(port, () => {
  console.log('[INFO] Listening on *:' + port);
});

module.exports = app;