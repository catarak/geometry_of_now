var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({limit: '5mb', extended: true }));
app.use(bodyParser.json());
app.use(express.static('client'));
// app.use(function(req, res, next) {
//   var data = new Buffer('');
//   req.on('data', function(chunk) {
//       console.log(fileType(chunk));
//       data = Buffer.concat([data, chunk]);
//   });
//   req.on('end', function() {
//     req.rawBody = data;
//     next();
//   });
// });

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/../client/index.html'));
});

app.get('/twitter', function(req, res) {
    res.sendFile(path.join(__dirname + '/../client/index2.html'));
});

app.get('/sequencer', function(req, res) {
    res.sendFile(path.join(__dirname + '/../client/sequencer.html'));
});

app.get('/beatgrid', function(req, res) {
    res.sendFile(path.join(__dirname + '/../client/beatgrid.html'));
});

app.get('/interface', function(req, res) {
    res.sendFile(path.join(__dirname + '/../client/interface.html'));
});


app.post('/sounds', function(req, res) {  
  var buf = Buffer.from(req.body.file, 'base64');
  
  fs.writeFile(path.join(__dirname + '/../client/sounds/' + req.body.filename), buf, function(err) {
    res.send('success');
  });
});

io.on('connection', function(socket){
  console.log('a user connected');
});
server.listen(3001);



require('dotenv').config()
var Twitter = require('twitter');

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

var stream = client.stream('statuses/filter', {track: 'fear'});
stream.on('data', function(event) {
  io.emit('tweet', event && event.text);
});
 
stream.on('error', function(error) {
  throw error;
});


