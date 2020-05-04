import React from 'react';
import axios from 'axios';
import io from 'socket.io-client';

// STYLES
import './styles/Friend.scss';

export default function Friend(props) {

    async function addNewFriend()
    {
        const url = "http://localhost:3500/addNewFriend/";
        const res = await axios.post(url, {clickedUserID: props.friend._id},
        {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "same-origin"
        });

        if(res.data.status === 200)
        {
            //window.location.reload();   // Will replace this line with socket io
            const selfUserID = res.data.selfUserID;

            const socket = io('http://localhost:3500/');
            socket.emit("updateLists", selfUserID);
            socket.emit("updateLists", props.friend._id);
            socket.emit("disconnect");
        }
        else
        {
            console.log(res.data)
        }
    }

    async function sendFriendReq()
    {
        const url = "http://localhost:3500/sendFriendReq";
        
        const res = await axios.post(url, {clickedUserID: props.friend._id},
        {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "same-origin"
        });

        if(res.data.status === 200)
        {
            const socket = io('http://localhost:3500/');
            socket.emit("updateLists", props.friend._id);
            socket.emit("disconnect");
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
            sendFriendReq();
        }
    }

    function handleAcceptFriendReq()
    {
        addNewFriend()
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
