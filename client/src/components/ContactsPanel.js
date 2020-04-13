import React from 'react';
import './styles/ContactsPanel.scss';

// This component will display a user's list of friends.
function Contacts(props) {
    return(
        <div style={{flexGrow: props.size}} className="contacts-container">
            <h2>Instant Messenger</h2>
            <p>{props.panelName}</p>
            {/* {(props.isActive) ? allUsers.map((f, i) => <h2 key={i}>{f.userName}</h2>) : null} */}
        </div>
    )
}

export default Contacts;