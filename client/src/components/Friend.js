import React from 'react';
import axios from 'axios';

// STYLES
import './styles/Friend.scss';

export default function Friend(props) {

    async function addNewFriend(newFriendId)
    {
        const url = "http://localhost:3500/addNewFriend/";
        await axios.post(url, {clickedUserID: newFriendId},
        {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "same-origin"
        })
        .then((res) => {
            console.log(res);
            window.location.reload();
        })
        .catch((err) => {
            console.log(err);
        })
    }

    function handleClick(e)
    {
        if(props.isFriend)
            props.openChat(props.roomID);
        else
            addNewFriend(props.friend._id);
    }

    return (
        <div onClick={handleClick} className="friend-container">
            <img className="profile-image" src={"https://api.adorable.io/avatars/285/" + props.friend._id} alt="user_pic"/>
            <h2 className="username">{props.friend.username}</h2> 
        </div>
    )
}
