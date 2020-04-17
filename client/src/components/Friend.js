import React from 'react';

// STYLES
import './styles/Friend.scss';

export default function Friend(props) {
    return (
        <div className="friend-container">
            <img className="profile-image" src={"https://api.adorable.io/avatars/285/" + props.friend._id} alt="user_pic"/>
            <h2 className="username">{props.friend.username}</h2> 
        </div>
    )
}
