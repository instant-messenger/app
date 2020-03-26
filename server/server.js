const express = require("express");
const app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

// Each entry will be an object with a 'userName' field
const users = [];

app.get('/', (request, response) => {
    response.send('<h1>Welcome to Instant Messenger</h1>');
});

io.on('connection', function(socket)
{
    // When the 'login event' is trigger, it expects a param 'name'
    socket.on('login', function(name)
    {
        console.log(name + " has login: " + socket.id);

        const user = {
            userName: name
        }

        users[socket.id] = user;

        const usersLength = Object.keys(users).length;
        console.log(usersLength + " users in total!");
    });

    socket.on('chat', function()
    {
        console.log(users[socket.id].userName + " is typing");
    });

});

module.exports = server;