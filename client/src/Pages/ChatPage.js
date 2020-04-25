import React, {useState, useEffect} from 'react';
import Contacts from '../components/ContactsPanel';
import ChatFeed from '../components/ChatFeed.js';
import io from "socket.io-client";
import axios from 'axios';
import './styles/ChatPage.scss';

// This Component will contain two other components;
// ContactsPanel Component: Display a list of users(Either users that belong in a room or a friends list)
// ChatLog Component: Where the text messages will be displayed

function ChatPage(props)
{
    const [user, setUser] = useState({_id: "", username: "", friends: []});
    const [userSocket, setSocket] = useState();
    const [messageText, setMessageText] = useState("");
    const [openRoomID, setRoomID] = useState("");
    const [isUpdated, setIsUpdated] = useState(true);

    useEffect(() => {
        const socket = io('http://localhost:3500/');
        setSocket(socket);
        
        async function getAuthenticationStatus()
        {
            let responseStatus = 0;
            await axios.get("http://localhost:3500/isAuth/", 
            {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: "same-origin"
            })
            .then((res) => 
            {
                setUser({_id: res.data._id, username: res.data.username, friends: res.data.friends});
                responseStatus = res.status;
            })
            .catch((err) =>
            {
                responseStatus = err.response.status;
            })

            return responseStatus;
        }
            
        async function checkAuthentication()
        {
            const authenticationStatus = await getAuthenticationStatus();

            if(authenticationStatus !== 200)
            {
                props.history.push('/');
            }
        }
        
        // Comment out the following line when styling chat page
        checkAuthentication();
        
    }, [props.history]);

    useEffect(() => {
        if(userSocket)
        {
            userSocket.on("requestUpdate", function()
            {
                if(!user._id) { return; }

                setIsUpdated(false);
            })
        }
    }, [userSocket, user._id]);

    function handleLogOut(e)
    {
        axios.get("http://localhost:3500/logout", 
        {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "same-origin"
        })
        .then((res) => 
        {
            if(res.status === 200)
            {
                props.history.push("/login");
            }
        })
        .catch((err) =>
        {
            console.log(err);
        })
    }
    
    function handleChange(e)
    {
        e.preventDefault();
        setMessageText(e.target.value);
        //userSocket.emit("chat", user.username);
    }

    async function sendMessage()
    {
        const url = "http://localhost:3500/sendMess/";
        
        const res = await axios.post(url, {messageText, openRoomID}, 
            {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "same-origin"
        });

        return res.status;
    }
    
    async function handleMessageSend(e)
    {
        e.preventDefault();
        if(openRoomID.length === 0 || messageText.length === 0) { return; }
        const postResStatus = await sendMessage();
        
        if(postResStatus === 200)
        {
            setMessageText("");
            userSocket.emit("messageNow", openRoomID);
        }
    }
    
    function openChat(roomID)
    {
        if(openRoomID === roomID) { return; }

        setRoomID(roomID);
        setMessageText("");
        userSocket.emit("joinRoom", roomID);
    }

    return(
        <div className="chat-page-container">
            {user.username ? <h1 className="chat-page-username">Welcome {user.username}</h1> : null}

            <div className="chat-page-comps">
                <Contacts openChat={openChat} userID={user._id} userSocket={userSocket} size={1} />
                <ChatFeed isUpdated={isUpdated} openRoom={openRoomID} handleUpdate={setIsUpdated} userSocket={userSocket} size={10}/>
            </div>

            {/* TODO Will update message sent in here */}
            <form onSubmit={handleMessageSend}>
                <input className="chat-page-input" onChange={handleChange} value={messageText} placeholder="Enter Message"/>
                <button type="submit">Send</button>
            </form>
                
            <button onClick={handleLogOut}>Log Out</button>
        </div>
    )
}

export default ChatPage;
