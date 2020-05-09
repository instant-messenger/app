import React, {useState, useEffect} from 'react';
import './styles/ContactsPanel.scss';
import axios from 'axios';


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

    async function handleLogOut()
    {        
        const res = await axios.get("http://localhost:3500/logout", 
        {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "same-origin"
        });
        
        if(res.data.status === 200)
        {
            userSocket.emit("logout", props.userID);
            props.history.push("/login");
        }
    }

    return(
        <div className="contacts-container">
            <div className="tab">
                <button className="tabButton" onClick={(e) => handleListsChange(true)}>Friends</button>
                <button className="tabButton" onClick={(e) => handleListsChange(false)}>Requests</button>
            </div>

            <h2 className="list-displayed">{isOnFriends ? "Friends" : "Friend Requests"}</h2>
            
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

            <button className="logout-button" onClick={handleLogOut}>Log Out</button>

        </div>
    )
}

export default Contacts;