import React from 'react'

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
        <div class="chat-feed-container">
        {fakeMessages.map((message) => {
            return (
                <div>message.user</div>
        )
        })}
        </div>
    )
}
