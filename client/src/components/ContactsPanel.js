import React, {useState, useEffect} from 'react';
import './styles/ContactsPanel.scss';
import axios from 'axios';

// Components
import Friend from './Friend';

const fakeFriends = [
    {
        id: 0,
        username: "robert",
        profileImgUrl: "https://images.unsplash.com/photo-1531750026848-8ada78f641c2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 1,
        username: "steven",
        profileImgUrl: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 2,
        username: "maria",
        profileImgUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 3,
        username: "fernando",
        profileImgUrl: "https://images.unsplash.com/photo-1535419218759-c71f0a6015b3?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 4,
        username: "martha",
        profileImgUrl: "https://images.unsplash.com/photo-1543949806-2c9935e6aa78?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"
    },
]

// This component will display a user's list of friends.
function Contacts(props) {
    
    const [friends, setFriends] = useState(fakeFriends);

    useEffect(() => {
        if(!props.userID) { return; }

        async function getMyFriends() {
            axios.get("http://localhost:3500/getFriends/" + props.userID, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: "same-origin"
            })
            .then((res) => {
                setFriends(res.data);
            })
            .catch((err) => {
                console.log(err);
            })
        }

        getMyFriends();
    }, [props.userID])

    return(
        <div style={{flexGrow: props.size}} className="contacts-container">
            <h2>Friends List</h2>
            {friends.map((friend) => <Friend key={friend.id} friend={friend}/>)}
        </div>
    )
}

export default Contacts;