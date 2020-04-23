import React, {useState, useEffect} from 'react';
import axios from 'axios';
import './styles/ChatFeed.scss';

// const fakeMessages = [
//     {
//         user: "fakeUser1",
//         message: "Hello how are you?"
//     }, 
//     {
//         user: "fakeUser2",
//         message: "I am doing well. You?"
//     }
// ]

export default function ChatFeed(props) 
{
    const [messages, setMessages] = useState([]);
    
    useEffect(() => 
    {
        if(props.openRoom.length === 0) { return; }

        const url = "http://localhost:3500/getMessages/" + props.openRoom;
        axios.get(url, 
        {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "same-origin"
        })
        .then((res) => {
            setMessages(res.data);
        })
        .catch((err) => {
            console.log(err);
        })
    }, [props.openRoom]);

    return (
        <div className="chat-feed-container" style={{flexGrow: props.size}}>
            {props.openRoom.length !== 0 ? <h2>Room ID: {props.openRoom}</h2> : null}
            {props.currentMessage.length !== 0 ? <h2>{props.currentMessage}</h2> : null}

            {messages.map((message, i) => {
                return (
                    <div key={i}>
                        <h2>{message.sender}: -{message.content}</h2>
                    </div>
                )
            })}
        </div>
    )
}
