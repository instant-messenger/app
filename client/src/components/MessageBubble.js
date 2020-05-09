import React from 'react';
import './styles/MessageBubble.scss';

function MessageBubble(props)
{
    return(
        
        <div className={props.isMyMessage ? "bubble-container my-message" : " bubble-container their-message"}>
            <p>{props.message}</p>
        </div>
        
    )
}

export default MessageBubble;