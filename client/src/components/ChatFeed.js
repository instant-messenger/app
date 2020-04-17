import React from 'react'

import './styles/ChatFeed.scss'

const fakeMessages = [
    {
        user: "fakeUser1",
        message: "Hello how are you?"
    }, 
    {
        user: "fakeUser2",
        message: "I am doing well. You?"
    }
]

export default function ChatFeed(props) {
    return (
        <div className="chat-feed-container" style={{flexGrow: props.size}}>
            {fakeMessages.map((message, i) => {
                return (
                    <div key={i}>
                        <h2>{message.message}</h2>
                    </div>
                )
            })}
        </div>
    )
}
