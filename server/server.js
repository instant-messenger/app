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
    friends: [String],
    roomIDs: [String]
});

const roomSchema = new mongoose.Schema({
    members: [String],
    messages: [{sender: String, content: String}]
});

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
    UserMod.register({username: req.body.username, friends: [], roomIDs: []}, req.body.password, function(err, newUser)
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
        const userData = {_id: req.user._id, username: req.user.username, friends: req.user.friends, roomIDs: req.user.roomIDs};
        res.status(200).send(userData);
    }
    else
    {
        res.status(401).send("Not authenticated");
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

// Using a user ID, this route retrieves that user's list of friends and room IDs
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

// Searches for a user in the database and returns it to the Search Component in the client side
app.get("/search/:name/", async function(req, res)
{
    if(!req.isAuthenticated())
    {
        res.status(401).send();
        return;
    }
    
    const user = await getSearchResult(req.params.name);

    res.status(200).send(user);
});

// Using two user IDs, it retrieves both users, add each other's IDs to their 'friends' array, and creates a new room so they can chat in.
app.post("/addNewFriend", async function(req, res)
{
    if(!req.isAuthenticated())
    {
        res.status(401).send();
        return;
    }
    
    const user1_ID = req.user._id;
    const user2_ID = req.body.clickedUserID;
    
    try 
    {
        const user1 = await UserMod.findById(user1_ID);
        const user2 = await UserMod.findById(user2_ID);
        
        if(!user1.friends.includes(user2_ID) && !user2.friends.includes(user1_ID))
        {
            user1.friends.push(user2_ID);
            user2.friends.push(user1_ID);
            
            const newRoom = new RoomMod({
                members: [user1_ID, user2_ID],
                messages: []
            });
            
            newRoom.save(function(err, room)
            {
                if(room)
                {                    
                    user1.roomIDs.push(room._id);
                    user2.roomIDs.push(room._id);
                    
                    user1.save();
                    user2.save();

                    res.status(200).send();
                }
                else if(err)
                {
                    console.log(err);
                }
                else
                {
                    res.status(500).send();
                }
            });
        }
        else
        {
            res.status(400).send("Already friends");
        }
    } 
    catch(error) 
    {
        console.log(error);
    }

})

// Retrieves messages from a specified room in the database
app.get("/getMessages/:roomID", async function(req, res)
{
    if(!req.isAuthenticated())
    {
        res.status(401).send();
        return;
    }

    const roomID = req.params.roomID;
    const room = await RoomMod.findById(roomID);
    res.status(200).send({messages: room.messages});
});

// Posts a message to a room that should exist in the database
app.post("/sendMess", async function(req, res)
{
    if(!req.isAuthenticated())
    {
        res.status(400).send();
        return;
    }

    try 
    {
        const messageContent = req.body.messageText;
        const senderName = req.user.username;
        const roomID = req.body.openRoomID;

        const room = await RoomMod.findById(roomID);

        room.messages.push({sender: senderName, content: messageContent});
        room.save(function(err)
        {
            if(err)
            {
                console.log(err);
                res.status(404).send();
            }
            else
            {
                res.status(200).send();
            }
        });
    } 
    catch (err) 
    {
        console.log(err);
        res.status(400).send();
    }
});

// ----------------Database End-----------------

// Returns an array that's populated with room ids and an array of friends belonging to that room
async function getUserFriends(userID)
{
    const user = await UserMod.findById(userID);

    return Promise.all(user.roomIDs.map(async (roomID) => 
    {
        const room = await RoomMod.findById(roomID);

        const groupFriends = await UserMod.find({'_id': {$in: room.members}});

        groupFriends.splice(groupFriends.findIndex(item => item.id === userID), 1);

        return {groupFriends, roomID};
    }));
}

// Using the user's input in the Search Component, it will look for a specified username in the database
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

    // This is called when a user clicks on a friend from the Contacts Panel Component. 
    // More than two users can be in a room.
    socket.on('joinRoom', function(roomID)
    {
        socket.leaveAll();
        socket.join(roomID);
        socket.emit("requestUpdate");
    });

    // This is called when a user sends a message to friends in a room. 
    // The server then notifies every user in the room to update their Chat Feed Component
    socket.on("messageNow", function(openRoomID)
    {
        io.in(openRoomID).emit("requestUpdate");

        // To see how many client sockets are in the specified room.
        // var room = io.sockets.adapter.rooms[openRoomID];
        // console.log("Sent: " + room.length)
    });

});


module.exports = server;