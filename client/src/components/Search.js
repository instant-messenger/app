import React, { useState } from 'react';
import Friend from './Friend';
import axios from 'axios';

// STYLES
import './styles/Search.scss';

export default function Search() {
    const [ searchInput, setSearchInput ] = useState("")
    const [ resultFriends, setResultFriends ] = useState()
    const [ friendStatus, setStatus ] = useState(-1);

    async function handleSearch(e)
    {
        setSearchInput(e.target.value);
        
        if(e.target.value.length === 0) {
            setResultFriends(null);
            return;
        }

        const url = "http://localhost:3500/search/" + e.target.value;
        
        const res = await axios.get(url, 
        {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "same-origin"
        });

        if(res.data.status === 200)
        {
            setResultFriends(res.data.foundUser);
            setStatus(res.data.friendStatus);
        }
    }

    return (
        <div className="search-container">
            <form>
                <input name="search" value={searchInput} onChange={handleSearch} type="text" placeholder="&#128269; Search"/>
            </form>
            <div className="result-friends-container">
                {resultFriends ? <Friend friendStatus={friendStatus} isSearchBarRes={true} key={resultFriends._id} friend={resultFriends} /> : null}
            </div>
        </div>
    )
}
