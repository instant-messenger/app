import React, {useState, useEffect} from 'react';
import './styles/ContactsPanel.scss';
import axios from 'axios';
//import FuzzySearch from 'fuzzy-search';


// Components
import Friend from './Friend';

// This component will display a user's list of friends and friend requests.
function Contacts(props) {
    const [allFriends, setAllFriends] = useState([]);
    const [allRequests, setRequests] = useState([]);
    const [filterText, setFilter] = useState("");
    const [displayedFriends, setDisplayFriends] = useState(allFriends);
    const [isOnFriends, setIsOnFriends] = useState(true);
    const [bAreListsUpdated, setListsUpdated] = useState(false);

    const {userSocket} = props;

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
                console.log(res.data)
            }
        }

        if(!bAreListsUpdated)
        {
            getMyFriends();
            getFriendRequests();
            setListsUpdated(true);
        }

    }, [props.userID, bAreListsUpdated]);

    useEffect(() => {
        if(userSocket)
        {
            userSocket.on("requestListsUpdate", function()
            {
                // Update friend reqeust list
                setListsUpdated(false);
            });

        }
    }, [userSocket])

    useEffect(() => 
    {
        if(props.userID && bAreListsUpdated)
        {
            setDisplayFriends(isOnFriends ? allFriends : allRequests);
        }
    }, [props.userID, bAreListsUpdated, isOnFriends, allFriends, allRequests])

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