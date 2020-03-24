const express = require("express");
const app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.get('/', (request, response) => {
    response.send('<h1>Welcome to Instant Messenger</h1>');
});

io.on('connection', function(socket){
    console.log('a user connected');
});

module.exports = server;