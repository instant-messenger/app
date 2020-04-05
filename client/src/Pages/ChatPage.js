import React from 'react';
import Contacts from '../components/ContactsPanel';
import './styles/ChatPage.css';

// This Component will contain two other components;
// ContactsPanel Component: Display a list of users(Either users that belong in a room or a friends list)
// ChatLog Component: Where the text messages will be displayed

function ChatPage(props)
{
    function handleChange(e)
    {
        props.userSocket.emit("chat");
    }

    return(
        <div className="chat-page-container">
            <h1>Chat Page</h1>
            
            <div className="chat-page-comps">
                <Contacts isActive={true} size={2} userSocket={props.userSocket} panelName="All Users Panel" />
                <Contacts isActive={false} size={5} userSocket={props.userSocket} panelName="This is where a chat log component will be in place later. Currently using a ContactsPanel component to view the layout." />
            </div>
                
            <input className="chat-page-input" onChange={handleChange} placeholder="Enter Message"/>

        </div>
    )
}

export default ChatPage;