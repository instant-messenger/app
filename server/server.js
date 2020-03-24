const express = require("express");

const server = express();

server.get('/', (request, response) => {
    response.send('<h1>Welcome to Instant Messenger</h1>');
});

module.exports = server;