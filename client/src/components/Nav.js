import React from 'react';
import { NavLink, Link } from 'react-router-dom';

// STYLES
import './styles/nav.scss';

export default function Nav() {
    return (
        <div className="nav-container">
            {/* <Link to="/"><h1>Instant Messenger</h1> </Link> */}
            <div className="navlink-container">
                <NavLink to="/chat">Chat</NavLink>
            </div>
        </div>
    )
}
