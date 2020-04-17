const express = require("express");
const mongoose = require('mongoose');
const app = express();
const server = require('http').createServer(app);
const cors = require('cors');
const bp = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const io = require('socket.io')(server);

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());
app.use(bp.urlencoded({extended: true}));

app.use(session({
    secret: 'Move to env File',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/messengerDB', {useUnifiedTopology: true, useNewUrlParser: true});

const userSchema = new mongoose.Schema({
	username: String,
    password: String,
    friends: [String]
});

const roomSchema = new mongoose.Schema({
    members: [String],
    messages: [{sender: String, content: String}]
})

// group schema will contain the following properties
    // _id, array of user ids, array of messages objects 
    // (the message object will contain: sender id, content, date and time) 

userSchema.plugin(passportLocalMongoose);

const UserMod = new mongoose.model("users", userSchema);
const RoomMod = new mongoose.model("rooms", roomSchema);

passport.use(UserMod.createStrategy());
passport.serializeUser(UserMod.serializeUser());
passport.deserializeUser(UserMod.deserializeUser());

// -----------------Database Start--------------------

app.post('/login', function(req, res)
{
    const returningUser = new UserMod({
		username: req.body.username,
		password: req.body.password
    });
    
    req.login(returningUser, function(err)
    {
        if(err)
        {
            res.status(404).send();
        }
        else
        {
            passport.authenticate("local")(req, res, function()
            {
                res.status(200).send();                
            });
        }
    })
});

app.post('/register', function(req, res)
{
    UserMod.register({username: req.body.username, friends: []}, req.body.password, function(err, newUser)
    {
        if(err)
            console.log(err);
        else
        {
            passport.authenticate("local")(req, res, function()
            {
                res.status(200).send();                
            });
        }
    })
})

app.get("/isAuth", function(req, res)
{
    if(req.isAuthenticated())
    {
        const userData = {_id: req.user._id, username: req.user.username, friends: req.user.friends};
        res.status(200).send(userData);
    }
    else
    {
        res.status(400).send("Error - Not authenticated");
    }
});

app.get('/logout', function(req, res)
{
    if(req.isAuthenticated())
    {
        req.logout();
        res.status(200).send();
    }
    else
    {
        res.status(401).send();
    }
})


app.get('/getFriends/:id/', async function(req, res)
{
    if(!req.isAuthenticated()) 
    { 
        res.status(401).send();
        return; 
    }
    
    const userID = req.params.id;
    const friends = await getUserFriends(userID);
    res.status(200).send(friends);
})

app.get("/testroom/", function(req, res)
{
    const newRoom = new RoomMod({
        members: ["5e93f958cd94be1cc8b55b08", "5e927b7e658b9430c4382921"],
        messages: [{
            sender: "5e927b7e658b9430c4382921",
            content: "Hi"
        }, {
            sender: "5e93f958cd94be1cc8b55b08",
            content: "Cancel That"
        }]
    });
    
    newRoom.save(function(err)
    {
        if(!err)
        {
            res.status(200).send("You Rock!");
        }
    });
})

app.post('/postmess/', function(req, res)
{
    const message = (req.body.content);
    const senderID = (req.user._id);
    
    RoomMod.findById("5e95585b63125b64dc3d089f", function(err, foundRoom)
    {
        if(foundRoom)
        {
            foundRoom.messages.push({sender: senderID, content: message});
            
            foundRoom.save(function(err)
            {
                if(!err)
                {
                    res.status(200).send();
                }
            });
        }
    });
    
})

app.get("/rooms/", async function(req, res)
{
    const all = await RoomMod.findById("5e95585b63125b64dc3d089f");
    res.status(200).send(all);
})

app.get("/search/:name/", async function(req, res)
{
    if(!req.isAuthenticated())
    {
        res.status(401).send();
        return;
    }

    const user = await getSearchResult(req.params.name);

    res.status(200).send(user);
})

// ----------------Database End-----------------
async function getUserFriends(userID)
{
    const user = await UserMod.findById(userID);

    const userFriends = user.friends.map(async (friendID) => {
        const friend = await UserMod.findById(friendID);
        return (friend);
    })

    return await Promise.all(userFriends);
}

function createNewRoom(memberIDs)
{
    const newRoom = new RoomMod({
        members: memberIDs,
        messages: []
    });

    newRoom.save();
}

async function getSearchResult(name)
{
    return await UserMod.findOne({username: name});
}

// ----------------Socket IO Start----------------------
io.on('connection', function(socket)
{
    // This is called when a user is typing on the input box in the /chat page
    socket.on('chat', function(username)
    {
        console.log(username + " is typing");
    });

});


module.exports = server;