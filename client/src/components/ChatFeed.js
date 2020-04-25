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
    
    const {isUpdated, openRoom, handleUpdate} = props;
    
    useEffect(() => 
    {
        async function getMessages()
        {
            const url = "http://localhost:3500/getMessages/" + openRoom;
            const res = await axios.get(url, 
            {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: "same-origin"
            })

            if(res.status === 200)
            {
                setMessages(res.data.messages);
            }
            
            return res.status;
        }
        
        async function updateMessages()
        {
            const resStatus = await getMessages();
            handleUpdate(resStatus === 200);
        }
        
        if(!isUpdated)
        {
            updateMessages();
        }

    }, [openRoom, isUpdated, handleUpdate]);


    return (
        <div className="chat-feed-container" style={{flexGrow: props.size}}>
            {props.openRoom.length !== 0 ? <h2>Room ID: {props.openRoom}</h2> : null}

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
