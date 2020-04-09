const express = require("express");
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const bp = require('body-parser');
const bcrypt = require('bcrypt');
const saltRounds = 10;

var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());
app.use(bp.urlencoded({extended: true}));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/messengerDB', {useUnifiedTopology: true, useNewUrlParser: true});

const userSchema = new mongoose.Schema({
	username: String,
	password: String,
});

const UserMod = new mongoose.model("users", userSchema);

// Each user will be an object with a 'userName' field
const users = [];

app.get('/', (request, response) => {
    response.send('<h1>Welcome to Instant Messenger</h1>');
});


// -----------------Database Start--------------------

// When login in, it makes sure that the username exists in the database
app.post('/login', function(req, res)
{
    const req_username = req.body.username;
    const req_password = req.body.password;

    // TODO On frontend, make sure username and password fields are not empty
    if(req_username === "" || req_password === "")
    {
        res.status(401);            // 401 Status = The requested page needs a username and a password.
        res.send();
    } 
    else
    {   
        UserMod.findOne({username: req_username}, function(err, foundUser)
        {
            if(err)
            {
                console.log(err);
            }
            else
            {
                if(foundUser)
                {
                    bcrypt.compare(req.body.password, foundUser.password, function(bcrypt_err, result)
                    {
                        res.status((bcrypt_err || !result ? 401 : 200));
                        res.send();
                    })
                }
                else
                {
                    res.status(404);
                    res.send();
                }
            }
        })
    }
})

// Before saving a new user to the database, it makes sure that username doesn't exists - Username will be replaced with email soon
app.post('/register', function(req, res)
{
    const req_username = req.body.username;
    const req_password = req.body.password;

    if(req_username === "" || req_password === "")
    {
        res.status(401);            // 401 Status = The requested page needs a username and a password.
        res.send();
    }
    else
    {
        UserMod.findOne({username: req_username}, function(err, foundUser)
        {
            if(err)
            {
                console.log(err);
                res.status(400);
                res.send();
            }
            else
            {
                if(foundUser)
                {
                    console.log("User exists");
                    res.status(401);                
                    res.send();
                }
                else
                {
                    const hash = bcrypt.hashSync(req_password, saltRounds);

                    const newUser = new UserMod({
                        username: req_username,
                        password: hash
                    });

                    newUser.save(function(saveErr)
                    {
                        res.status((saveErr ? 500 : 200));
                        res.send();
                    });
                }
            }
        })
    }
})

// ----------------Database End-----------------

// ----------------Socket IO Start----------------------
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
    socket.on('chat', function(userName)
    {
        console.log(userName + " is typing");
    });


    // ----------Note: the bottom code will be updated to display a friends list-------------

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