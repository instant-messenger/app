import React, {useState, useEffect} from 'react';
import Contacts from '../components/ContactsPanel';
import io from "socket.io-client";
import axios from 'axios';
import './styles/ChatPage.scss';

// This Component will contain two other components;
// ContactsPanel Component: Display a list of users(Either users that belong in a room or a friends list)
// ChatLog Component: Where the text messages will be displayed

function ChatPage(props)
{
    const [user, setUser] = useState({_id: "", username: ""});
    const [socket, setSocket] = useState();

    useEffect(() => {
        const socket = io('http://localhost:3500/');
        setSocket(socket);

        axios.get("http://localhost:3500/isAuth", 
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
                setUser({_id: response.data._id, username: response.data.username});
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

    function handleChange(e)
    {
        socket.emit("chat", user.username);
    }

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

    return(
        <div className="chat-page-container">
            <h1>Chat Page</h1>
            {user.username ? <p>Welcome {user.username}</p> : null}

            <div className="chat-page-comps">
                <Contacts isActive={true} size={2} userSocket={props.userSocket} panelName="All Users Panel" />
                <Contacts isActive={false} size={4} userSocket={props.userSocket} panelName="This is where a chat log component will be in place later. Currently using a ContactsPanel component to view the layout." />
            </div>
                
            <input className="chat-page-input" onChange={handleChange} placeholder="Enter Message"/>

            <button onClick={handleLogOut}>Log Out</button>

        </div>
    )
}

export default ChatPage;