var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var path = require('path');

app.use(express.static('client'));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/../client/index.html'));
});

app.get('/twitter', function(req, res) {
    res.sendFile(path.join(__dirname + '/../client/index2.html'));
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


