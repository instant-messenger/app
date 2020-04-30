import React, {useState, useEffect} from 'react';
import './styles/ContactsPanel.scss';
import axios from 'axios';
//import FuzzySearch from 'fuzzy-search';


// Components
import Friend from './Friend';

// const fakeFriends = [
//     {
//         id: 0,
//         username: "robert",
//         profileImgUrl: "https://images.unsplash.com/photo-1531750026848-8ada78f641c2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"
//     },
//     {
//         id: 1,
//         username: "steven",
//         profileImgUrl: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"
//     },
//     {
//         id: 2,
//         username: "maria",
//         profileImgUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"
//     },
//     {
//         id: 3,
//         username: "fernando",
//         profileImgUrl: "https://images.unsplash.com/photo-1535419218759-c71f0a6015b3?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"
//     },
//     {
//         id: 4,
//         username: "martha",
//         profileImgUrl: "https://images.unsplash.com/photo-1543949806-2c9935e6aa78?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"
//     },
// ]

// This component will display a user's list of friends.
function Contacts(props) {
    const [allFriends, setAllFriends] = useState([]);
    const [allRequests, setRequests] = useState([]);
    const [filterText, setFilter] = useState("");
    const [displayedFriends, setDisplayFriends] = useState([]);
    const [isOnFriends, setIsOnFriends] = useState(true);

    useEffect(() => {
        if(!props.userID) { return; }

        async function getMyFriends() 
        {
            const url = "http://localhost:3500/getFriends/";

            const res = await axios.get(url, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: "same-origin"
            });
            
            if(res.data.status === 200)
            {
                setAllFriends(res.data.friends);
                setDisplayFriends(res.data.friends);
            }
        }

        async function getFriendRequests()
        {
            const url = "http://localhost:3500/getFriendReqs/";

            const res = await axios.get(url, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: "same-origin"
            });
            
            if(res.data.status === 200)
            {
                setRequests(res.data.friendReqsData);
            }
        }

        getMyFriends();
        getFriendRequests();

    }, [props.userID])

    const handleChanges = (e) => 
    {
        setFilter(e.target.value);
        if(e.target.value.length === 0) 
        {
            setDisplayFriends(isOnFriends ? allFriends : allRequests)
        } 
        else 
        {
            const listOfUsers = isOnFriends ? allFriends : allRequests;

            const filtered = (listOfUsers).filter((group) => {
                return (isOnFriends ? group.groupFriends[0].username.includes(e.target.value) 
                        : group.username.includes(e.target.value));
            });

            setDisplayFriends(filtered);
        }
    }

    function handleListsChange(status)
    {
        setIsOnFriends(status);

        if(status)
            setDisplayFriends(allFriends);
        else
            setDisplayFriends(allRequests);

        setFilter("");
    }

    return(
        <div className="contacts-container" style={{flexGrow: props.size}}>
            <div className="tab">
                <button className="tablinks" onClick={(e) => handleListsChange(true)}>Friends</button>
                <button className="tablinks" onClick={(e) => handleListsChange(false)}>Friend Requests</button>
            </div>

            <h2>{isOnFriends ? "Friends" : "Friend Requests"}</h2>
            
            <input placeholder={isOnFriends ? "Search Friends" : "Search Friend Requests"} 
                onChange={handleChanges} value={filterText}
            />

            <div className="friends-list-container">
                {displayedFriends.map((friend, i) =>
                    <Friend key={i} 
                            openChat={isOnFriends ? props.openChat : null} 
                            friendStatus={isOnFriends ? 0 : 1} 
                            roomID={isOnFriends ? friend.roomID : null}
                            friend={isOnFriends ? friend.groupFriends[0] : {_id: friend._id, username: friend.username}}
                            isSearchBarRes={false}
                    /> 
                )}
            </div>
        </div>
    )
}

export default Contacts;