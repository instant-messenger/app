import React from 'react';

// STYLES
import './styles/Friend.scss';

export default function Friend(props) {
    return (
        <div className="friend-container">
            <img className="profile-image" src={props.friend.profileImgUrl}/>
            <h2 className="username">{props.friend.username}</h2> 
        </div>
    )
}
