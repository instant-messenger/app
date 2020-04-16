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

export default function ChatFeed() {
    return (
        <div className="chat-feed-container">
        {fakeMessages.map((message, index) => {
            return (
                <div key={index}>message.user</div>
        )
        })}
        </div>
    )
}
