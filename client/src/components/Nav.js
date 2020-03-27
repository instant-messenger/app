import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Nav() {
    return (
        <div className="nav-container">
            <h1>Navigation</h1> 
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/dashboard">Dashboard</NavLink>
        </div>
    )
}
