import React from 'react';
import axios from 'axios';

// STYLES
import './styles/Friend.scss';

export default function Friend(props) {

    async function addNewFriend(newFriendId)
    {
        const url = "http://localhost:3500/addNewFriend/";
        const res = await axios.post(url, {clickedUserID: newFriendId},
        {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "same-origin"
        });

        if(res.data.status === 200)
        {
            window.location.reload();   // Will replace this line with socket io
        }
    }

    async function sendFriendReq(otherFriendID)
    {
        const url = "http://localhost:3500/sendFriendReq";
        
        const res = await axios.post(url, {clickedUserID: otherFriendID},
        {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "same-origin"
        });

        if(res.data.status === 200)
        {
            console.log(res.data.message);
            window.location.reload();
        }
        else
        {
            console.log(res.data.message);
        }
    }

    function handleClick(e)
    {
        if(props.friendStatus === 0 && !props.isSearchBarRes)
        {
            // Updates Chat Feed messages if clicking on a friend
            props.openChat(props.roomID);
        }
        else if(props.friendStatus === 3 && props.isSearchBarRes)
        {
            // Sends friend request to someone who is not a friend yet
            sendFriendReq(props.friend._id);
        }
    }

    function handleAcceptFriendReq()
    {
        addNewFriend(props.friend._id)
    }

    return (
        <div className="friend-container" style={props.friendStatus === 2 ? {backgroundColor: "gold"} : null}>
            <div className="friend-info" onClick={handleClick} >
                <img className="profile-image" src={"https://api.adorable.io/avatars/285/" + props.friend._id} alt="user_pic"/>
                <h2 className="username">{props.friend.username}</h2>
            </div>
                {props.friendStatus === 1 ? <button onClick={handleAcceptFriendReq} className="myButton">Accept</button> : null}
        </div>
        
    )
}
