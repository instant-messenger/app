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
    roomIDs: [String],
    friendReqs: [String]
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
            res.send({status: 401, message: "User Not Found"});
        }
        else
        {
            passport.authenticate("local")(req, res, function()
            {
                res.send({status: 200, message: "Sucessful Login"});                
            });
        }
    })
});

app.post('/register', function(req, res)
{
    UserMod.register({username: req.body.username, friends: [], roomIDs: [], friendReqs: []}, req.body.password, function(err, newUser)
    {
        if(err)
        {
            res.send({status: 401, message: "Unable to Register."});
        }
        else
        {
            passport.authenticate("local")(req, res, function()
            {
                res.send({status: 200, message: "Registration Successful"});                
            });
        }
    })
})

app.get("/isAuth", function(req, res) 
{
    if(req.isAuthenticated())
    {
        const userData = {_id: req.user._id, username: req.user.username}
        
        res.send({status: 200, message: "User is authenticated", userData});
    }
    else
    {
        res.send({status: 401, message: "User is not authenticated"});
    }
});

app.get('/logout', function(req, res)
{
    if(req.isAuthenticated())
    {
        req.logout();
        res.send({status: 200, message: "Successful Logout"});
    }
    else
    {
        res.send({status: 401, message: "Unable to Logout"});
    }
});

// Using a user ID, this route retrieves that user's list of friends and room IDs
app.get('/getFriends', async function(req, res)
{
    if(!req.isAuthenticated()) 
    { 
        res.send({status: 401, message: "User is not Authenticated"});
        return; 
    }
    
    try
    {
        const userID = req.user.id;
        const friends = await getUserFriends(userID);
        res.send({status: 200, friends});
    }
    catch(err)
    {
        res.send({status: 404, message: "Unable to get friends"});
    }
});

// Searches for a user in the database and returns it to the Search Component in the client side
app.get("/search/:name/", async function(req, res)
{
    if(!req.isAuthenticated())
    {
        res.send({status: 401, message: "User is not Authenticated"});
        return;
    }

    try
    {
        let friendStatus = -1;
        const selfUser_ID = req.user.id;

        const selfUser = await UserMod.findById(selfUser_ID);
        const foundUser = await getSearchResult(req.params.name);

        if(selfUser_ID === foundUser.id)
        {
            return;
        }
        
        if(foundUser.friends.includes(selfUser_ID))
        {
            friendStatus = 0;   // Already friends.
        }
        else if(selfUser.friendReqs.includes(foundUser.id))
        {
            friendStatus = 1;   // selfUser has a pending friend request from the user they searched for.
        }
        else if(foundUser.friendReqs.includes(selfUser_ID))
        {
            friendStatus = 2;   // selfUser has already sent a friend request to the user they searched for.
        }
        else
        {
            friendStatus = 3;   // The selfUser and search result are not friends nor have sent each other a friend request.
        }

        res.send({status: 200, foundUser, friendStatus});
    }
    catch(err)
    {
        res.send({status: 404});
    }
    
});

app.post("/sendFriendReq", async function(req, res)
{
    if(!req.isAuthenticated())
    {
        res.send({status: 401, message: "User is not Authenticated"});
        return;
    }

    try
    {
        const selfUser_ID = req.user.id;
        const userToAdd_ID = req.body.clickedUserID;
        const userToAdd = await UserMod.findById(userToAdd_ID);

        // Before sending a friend request, it checks if user has already sent a friend request or are already friends. 
        if(!userToAdd.friendReqs.includes(selfUser_ID) && !userToAdd.friends.includes(selfUser_ID))
        {
            userToAdd.friendReqs.push(selfUser_ID);
            userToAdd.save();
            res.send({status: 200, message: "Friend Request Sent"});
        }
        else
        {
            res.send({status: 400, message: "Already friends or requested user has a pending friend request"});
        }
    }
    catch(err)
    {
        res.send({status: 404, message: "User not found"});
    }
});

// Using two user IDs, it retrieves both users, add each other's IDs to their 'friends' array, and creates a new room so they can chat in.
app.post("/addNewFriend", async function(req, res)
{
    if(!req.isAuthenticated())
    {
        res.send({status: 401, message: "User is not Authenticated"});
        return;
    }
        
    try 
    {
        const userWithRequest_ID = req.user.id;
        const pendingFriend_ID = req.body.clickedUserID;
    
        const userWithRequest = await UserMod.findById(userWithRequest_ID);
        const pendingFriend = await UserMod.findById(pendingFriend_ID);

        if(userWithRequest.friends.includes(pendingFriend_ID) || pendingFriend.friends.includes(userWithRequest_ID))
        {
            res.send({status: 400, message: "Already friends"});
            return;
        }
        
        const index = userWithRequest.friendReqs.indexOf(pendingFriend_ID);
        if (index > -1) 
        {
            userWithRequest.friendReqs.splice(index, 1);
        }
        else
        {
            res.send({status: 401, message: "No Friend Request Found"});
            return;
        }

        userWithRequest.friends.push(pendingFriend_ID);
        pendingFriend.friends.push(userWithRequest_ID);
        
        const newRoom = new RoomMod({
            members: [userWithRequest_ID, pendingFriend_ID],
            messages: []
        });
        
        newRoom.save(function(err, room)
        {
            if(room)
            {                    
                userWithRequest.roomIDs.push(room._id);
                pendingFriend.roomIDs.push(room._id);
                
                userWithRequest.save();
                pendingFriend.save();

                res.send({status: 200, message: "Friends Added Successfully", selfUserID: userWithRequest_ID});
            }
            else
            {
                res.send({status: 500, message: "Failed to add Friends"});
            }
        });
    } 
    catch(error) 
    {
        res.send({status: 404, message: "Failed to Add Friends"});
    }
});

// Retrieves messages from a specified room in the database
app.get("/getMessages/:roomID", async function(req, res)
{
    if(!req.isAuthenticated())
    {
        res.send({status: 401, message: "User is not Authenticated"});
        return;
    }

    const roomID = req.params.roomID;
    const room = await RoomMod.findById(roomID);

    if(room.members.includes(req.user.id))
        res.send({status: 200, messages: room.messages});
    else
        req.send({status: 500, err: "Unable to get Messages"});
});

// Posts a message to a room that should exist in the database
app.post("/sendMess", async function(req, res)
{
    if(!req.isAuthenticated())
    {
        res.send({status: 401, message: "User is not Authenticated"});
        return;
    }

    try 
    {
        const messageContent = req.body.messageText;
        const senderName = req.user.username;
        const roomID = req.body.openRoomID;

        const room = await RoomMod.findById(roomID);
        room.messages.push({sender: senderName, content: messageContent});

        room.save();
        res.send({status: 200, message: "Message was sent successfully"});
    }
    catch (err) 
    {
        console.log(err);
        res.send({status: 500, message: "Unable to send message"});
    }
});

// Using the user id, it retrieves information about every user from their friend request list
app.get("/getFriendReqs", async function(req, res)
{
    if(!req.isAuthenticated())
    {
        res.send({status: 401, message: "User is not Authenticated"});
        return;
    }

    try
    {
        const user_ID = req.user.id;
        const friendReqsData = await getFriendRequestsData(user_ID);

        res.send({status: 200, friendReqsData});
    }
    catch(err)
    {
        res.send({status: 404, message: "Unable to get friend requests"});
    }
});

// ----------------Database End-----------------

async function getFriendRequestsData(userID)
{
    const user = await UserMod.findById(userID);
    
    const friendReqsData = user.friendReqs.map(async (friendReq_ID) => {
        const pendingUser = await UserMod.findById(friendReq_ID, '_id, username');
        return pendingUser;           
    });

    return Promise.all(friendReqsData);
}

// Returns an array that's populated with room ids and an array of friends belonging to that room
async function getUserFriends(userID)
{
    const user = await UserMod.findById(userID);

    return Promise.all(user.roomIDs.map(async (roomID) => 
    {
        const room = await RoomMod.findById(roomID);

        const groupFriends = await UserMod.find({'_id': {$in: room.members}}, '_id, username');

        groupFriends.splice(groupFriends.findIndex(item => item.id === userID), 1);

        return {groupFriends, roomID};
    }));
}

// Using the user's input in the Search Component, it will look for a specified username in the database
async function getSearchResult(name)
{
    return await UserMod.findOne({username: name});
}

const connectedUsers = {};

// ----------------Socket IO Start----------------------
io.on('connection', function(socket)
{
    // When the user connects to the chat page, set the socket id to the user id from database
    socket.on('connectUser', function(userID)
    {
        connectedUsers[userID] = socket.id;
    });

    // This is called when a user is typing on the input box in the /chat page
    socket.on('chat', function(chatInfo)
    {
        socket.to(chatInfo.roomID).emit('typing', chatInfo.username);
    });

    // This is called when a user clicks on a friend from the Contacts Panel Component. 
    // More than two users can be in a room.
    socket.on('joinRoom', function(oldRoomID, newRoomID)
    {
        if(oldRoomID.length !== 0)
        {
            socket.leave(oldRoomID);
        }

        socket.join(newRoomID);
        socket.emit("requestMessageUpdate");
    });

    // This is called when a user sends a message to friends in a room. 
    // The server then notifies every user in the room to update their Chat Feed Component
    socket.on("messageNow", function(openRoomID)
    {
        io.in(openRoomID).emit("requestMessageUpdate");

        // To see how many client sockets are in the specified room.
        // var room = io.sockets.adapter.rooms[openRoomID];
        // console.log("Sent: " + room.length)
    });

    // This is called when a user accepts or sends friend requests.
    socket.on("updateLists", function(userID)
    {
        const userSocketID = connectedUsers[userID];
        io.to(userSocketID).emit("requestListsUpdate");
    })

    socket.on("logout", function(userID)
    {
        socket.leaveAll();
        delete connectedUsers[userID];
    })
});


module.exports = server;