import React from 'react';

function ChatPage(props)
{
    function handleChange(e)
    {
        props.userSocket.emit("chat");
    }

    return(
        <div>
            <h1>Chat Page</h1>
            <input onChange={handleChange} placeholder="Enter Message"/>
        </div>
    )
}

export default ChatPage