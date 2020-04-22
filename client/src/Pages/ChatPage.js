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

    useEffect(() => {
        const socket = io('http://localhost:3500/');
        setSocket(socket);
        
        axios.get("http://localhost:3500/isAuth/", 
        {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
              },
            credentials: "same-origin"
        })
        .then((response) => 
        {
            if(response.status === 200)
            {         
                setUser({_id: response.data._id, username: response.data.username, friends: response.data.friends});
            }
            else
            {
                props.history.push("/")
            }
        })
        .catch((err) => 
        {
            console.log(err);
        })
        
    }, [props.history]);

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
        userSocket.emit("chat", user.username);
    }
    
    function openChat(roomID)
    {
        setRoomID(roomID);
    }

    return(
        <div className="chat-page-container">
            {user.username ? <h1 className="chat-page-username">Welcome {user.username}</h1> : null}

            <div className="chat-page-comps">
                <Contacts openChat={openChat} userID={user._id} userSocket={userSocket} size={1} />
                <ChatFeed openRoom={openRoomID} currentMessage={messageText} size={10}/>
            </div>

            {/* TODO Will update message sent in here */}
            <form>
                <input className="chat-page-input" onChange={handleChange} placeholder="Enter Message"/>
                <button type="submit">Send</button>
            </form>
                
            <button onClick={handleLogOut}>Log Out</button>
        </div>
    )
}

export default ChatPage;

// function sendMessage(e)
// {
//     e.preventDefault();
//     const url = "http://localhost:3500/postmess/";

//     axios.post(url, {content: messageText}, 
//     {
//         withCredentials: true,
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         credentials: "same-origin"
//     })
//     .then((res) => {
//         console.log(res);
//     })
//     .catch((err) => {
//         console.log(err);
//     })
// }