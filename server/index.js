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

require('dotenv').config()
var Twitter = require('twitter');

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

var database = require('./database.json');
var stream;
var calm;

function createNewStream(word) {
  stream = client.stream('statuses/filter', {track: word});
  stream.on('data', function(event) {
    io.emit('tweet', event && event.text);
  });
   
  stream.on('error', function(error) {
    if (error.message == 'Status Code: 420') {
      calm++;
    }
  });

  stream.on('end', function (response) {
    setTimeout(function () {
      createNewStream(database.word);
    }, 1000 * calm);
  });
}

createNewStream(database.word);

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

app.get('/admin', function(req, res) {
  res.sendFile(path.join(__dirname + '/../client/admin.html'));
});

app.post('/search', function(req, res) {
  database.word = req.body.searchTerm;
  io.emit('clear', database.word);
  stream.destroy();
  fs.writeFile('./server/database.json', JSON.stringify(database, null, 2));
  res.json({success: true});
});


app.post('/sounds', function(req, res) {  
  var buf = Buffer.from(req.body.file, 'base64');
  
  fs.writeFile(path.join(__dirname + '/../client/sounds/' + req.body.filename), buf, function(err) {
    res.send('success');
  });
});

io.on('connection', function(socket){
  io.emit("initialize", database);
  socket.on("beatgrid", function(data) {
    //write to json file.
    if (database.grids === undefined) {
      database.grids = [];
      var newGrid = data.grid;
      database.grids[data.index] = newGrid;
      fs.writeFile('./server/database.json', JSON.stringify(database, null, 2));
    } else {
      var newGrid = data.grid;
      database.grids[data.index] = newGrid;
      fs.writeFile('./server/database.json', JSON.stringify(database, null, 2));
    }
  });


  socket.on("sample", function(data) {
    if (database.samples === undefined) {
      database.samples = [];
    }
    database.samples[data.index] = data.sample;
    fs.writeFile('./server/database.json', JSON.stringify(database, null, 2));
  });
});
server.listen(3001);


