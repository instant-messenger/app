import React, {useState, useEffect} from 'react';
import './styles/ContactsPanel.css';

// When a new user is connected, their name should appear in this list.
// This will be similar to when a new user joins a room, or having a 'friends list'

function Contacts(props)
{
    const [allUsers, setUsers] = useState([]);

    // When a new user is redirected to the /chat page, every client will have their list updated
    useEffect(() => {
        props.userSocket.emit('getAllUsers');
        props.userSocket.on('getUsers', function(users)
        {
            setUsers(users);
        })
    }, [props.userSocket]);

    return(
        <div style={{flexGrow: props.size}} className="contacts-container">

            <h2>{props.panelName}</h2>
            {(props.isActive) ? allUsers.map((f, i) => <h2 key={i}>{f.userName}</h2>) : null}
        
        </div>
    )
}

export default Contacts;