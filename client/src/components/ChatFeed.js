import React, {useState, useEffect} from 'react';
import axios from 'axios';
import './styles/ChatFeed.scss';

export default function ChatFeed(props) 
{
    const [messages, setMessages] = useState([]);

    const [messageText, setMessageText] = useState("");
    const [isUpdated, setIsUpdated] = useState(true);

    // States to display "X is typing" at the bottom of the page
    const [friendTyping, setFriendTyping] = useState("");
    const [isDecreasing, setIsDecreasing] = useState(false);
    const [timeLeft, setTime] = useState(0);
    const messageDuration = 2;

    const {user, openRoomID, userSocket} = props;
    
    useEffect(() => 
    {
        async function getMessages()
        {
            const url = "http://localhost:3500/getMessages/" + openRoomID;

            const res = await axios.get(url, 
            {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: "same-origin"
            })

            if(res.data.status === 200)
            {
                setMessages(res.data.messages);
            }
            
            return res.data.status;
        }
        
        async function updateMessages()
        {
            const resStatus = await getMessages();
            setIsUpdated(resStatus === 200);
        }
        
        if(!isUpdated)
        {
            updateMessages();
        }
        else
        {
            setIsDecreasing(false);
            setTime(0);
        }

    }, [openRoomID, isUpdated]);
    
    useEffect(() => 
    {
        if(userSocket)
        {
            userSocket.on("requestUpdate", function()
            {
                if(!user._id) { return; }

                setIsUpdated(false);
            })

            userSocket.once("typing", function(otherUsername)
            {
                if(!user._id) { return; }

                setTime(messageDuration);
                setIsDecreasing(true);
                setFriendTyping(otherUsername);
            })
        }
    }, [userSocket, user._id, timeLeft]);

    useEffect(() =>
    {
        if(timeLeft !== messageDuration && !isDecreasing) 
        { 
            setFriendTyping(""); 
            return; 
        }

        let interval = setInterval(() => 
        {
            setTime(prev => prev - 1);

            if(timeLeft <= 0)
            {
                setIsDecreasing(false);
                setFriendTyping("");
            }
        }, 1000);
        
        return () => clearInterval(interval)
    }, [timeLeft, isDecreasing]);

    useEffect(() => {
        setMessageText("");
    }, [openRoomID]);

    function handleChange(e)
    {
        e.preventDefault();
        setMessageText(e.target.value);
        userSocket.emit("chat", {username: user.username, roomID: openRoomID});
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

        return res.data.status;
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

    return (
        <div className="chat-feed-container" style={{flexGrow: props.size}}>
            {openRoomID.length !== 0 ? <h2>Room ID: {openRoomID}</h2> : null}

            {messages.map((message, i) => {
                return (
                    <div key={i}>
                        <h2>{message.sender}: -{message.content}</h2>
                    </div>
                )
            })}

            {friendTyping.length !== 0 ? <p>{friendTyping + " is typing..."}</p> : null}
            
            <form onSubmit={handleMessageSend}>
                <input className="chat-page-input" onChange={handleChange} value={messageText} placeholder="Enter Message"/>
                <button type="submit">Send</button>
            </form>
        </div>
    )
}
