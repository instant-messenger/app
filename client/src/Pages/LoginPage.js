import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

import "./styles/LoginPage.scss";

function LoginPage(props)
{
    const [inputs, setInputs] = React.useState({
        username: "",
        password: "",
    });

    function handleClick(e) 
    {
        e.preventDefault();
        
        // This url will go inside the .env file
        var url = 'http://localhost:3500/login';
        
        // Making an api post with the 'inputs' object to check if user exists
        axios.post(url, inputs, 
        {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "same-origin"
        })
        .then((response) => 
        {
            if(response.status === 200)
            {
                props.history.push("/chat");
            }
        })
        .catch((err) => 
        {
            console.log(err)
        })
    }
    
    function handleTyping(e) {
        e.preventDefault();
        setInputs({...inputs, [e.target.name]: e.target.value});
    }

    return(
        <div className="container">
            <div className="form-container">
                <h2>Login below</h2>
                <form className="form" onSubmit={handleClick}>
                    <input name="username" value={inputs.username} onChange={handleTyping} placeholder="Username"></input>
                    <input name="password" type="password" value={inputs.password} onChange={handleTyping} placeholder="Password"></input>
                    <button type="submit" className="login-page-button">Submit</button>
                    <p>Not a user? <Link to="/">Register</Link> </p>
                </form>
            </div>
        </div>
    )
}

export default LoginPage;