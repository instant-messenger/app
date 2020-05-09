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
    const [friendName, setFriendName] = useState("");

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
    
    function openChat(newRoomID, friend)
    {
        const oldRoom = openRoomID;
        if(oldRoom === newRoomID) { return; }
        
        setFriendName(friend);
        setRoomID(newRoomID);
        userSocket.emit("joinRoom", oldRoom, newRoomID);
    }
    
    return(
        <div className="chat-page-container">
            <div className="chat-page-comps">
                <Contacts {...props} openChat={openChat} userID={user._id} userSocket={userSocket} />
                <ChatFeed user={user} openRoomID={openRoomID} friendName={friendName} userSocket={userSocket} isContactsCollapsed={props.isContactsCollapsed} />
            </div>

        </div>
    )
}

export default ChatPage;
