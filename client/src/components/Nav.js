import React from 'react';
import { NavLink } from 'react-router-dom';

// STYLES
import './styles/nav.scss';

export default function Nav() {
    return (
        <div className="nav-container">
            <h1>Instant Messenger</h1> 
            <div className="navlink-container">
                <NavLink to="/register">Register</NavLink>
                <NavLink to="/login">Login</NavLink>
                <NavLink to="/dashboard">Dashboard</NavLink>
            </div>
        </div>
    )
}
