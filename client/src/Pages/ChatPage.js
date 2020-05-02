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
    const [user, setUser] = useState({_id: "", username: ""});
    const [userSocket, setSocket] = useState();
    const [openRoomID, setRoomID] = useState("");

    useEffect(() => {
        async function checkAuthentication()
        {
            const res = await axios.get("http://localhost:3500/isAuth/", 
            {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: "same-origin"
            }); 

            if(res.data.status === 200)
            {
                setUser(res.data.userData);
                
                const socket = io('http://localhost:3500/');
                socket.emit("connectUser", res.data.userData._id);
                setSocket(socket);
            }
            else
            {
                props.history.push('/');
            };
        }
        
        // Comment out the following line when styling chat page
        checkAuthentication();
    }, [props.history]);

    async function handleLogOut()
    {        
        const res = await axios.get("http://localhost:3500/logout", 
        {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "same-origin"
        });
        
        if(res.data.status === 200)
        {
            userSocket.emit("logout", user._id);
            props.history.push("/login");
        }
    }
    
    function openChat(newRoomID)
    {
        const oldRoom = openRoomID;
        if(oldRoom === newRoomID) { return; }

        setRoomID(newRoomID);
        userSocket.emit("joinRoom", oldRoom, newRoomID);
    }

    return(
        <div className="chat-page-container">
            {user.username ? <h1 className="chat-page-username">Welcome {user.username}</h1> : null}

            <div className="chat-page-comps">
                <Contacts openChat={openChat} userID={user._id} userSocket={userSocket} size={1} />
                <ChatFeed user={user} openRoomID={openRoomID} userSocket={userSocket} size={10}/>
            </div>

            <button onClick={handleLogOut}>Log Out</button>
        </div>
    )
}

export default ChatPage;
