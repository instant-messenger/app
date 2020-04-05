const express = require("express");
const app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

// Each user will be an object with a 'userName' field
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
            userName: name,
            friends: [],
            id: socket.id
        }

        users[socket.id] = user;

        const usersLength = Object.keys(users).length;
        console.log(usersLength + " users in total!");
    });

    // This is called when a user is typing on the input box in the /chat page
    socket.on('chat', function()
    {
        console.log(users[socket.id].userName + " is typing");
    });


    // This is called when a user is directed to the /chat page
    socket.on('getAllUsers', function() 
    {
        // Goes through the users dictionary and pushes each user to an array
        var result = Object.keys(users).map(function (key) {
            return (users[key]);
        });

        // Returns the result array from above to the front-end - specifically to ContactsPanel component
        io.emit('getUsers', result);
    });
});




module.exports = server;