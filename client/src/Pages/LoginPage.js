import React from 'react';
import { Link } from 'react-router-dom';
import "./styles/LoginPage.css";

function LoginPage(props)
{
    const [name, setName] = React.useState();

    function handleClick(e)
    {
        props.handleSubmission(name);
    }

    function handleTyping(e)
    {
        setName(e.target.value);
    }

    return(
        <div>
            <h1>Login Page</h1>
            <Link className="login-page-button" onClick={handleClick} to="/chat">Submit</Link>
            <input onChange={handleTyping} placeholder="Set Name"></input>
        </div>
    )
}

export default LoginPage;