import React, {useState, useEffect} from 'react';
import './styles/ContactsPanel.scss';
import axios from 'axios';

// This component will display a user's list of friends.
function Contacts(props) {
    
    const [friends, setFriends] = useState([]);

    useEffect(() => {
        if(!props.userID) { return; }

        async function getMyFriends() 
        {
            axios.get("http://localhost:3500/getFriends/" + props.userID, 
            {
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
            {friends.map((f, i) => <h2 key={i}>{f.username}</h2>)}
        </div>
    )
}

export default Contacts;