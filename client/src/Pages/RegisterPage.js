import React from 'react';
import "./styles/LoginPage.scss";
import axios from 'axios';
import { Link } from 'react-router-dom';

function RegisterPage(props)
{
    const [inputs, setInputs] = React.useState({
        username: "",
        password: "",
    });

    function handleClick(e) 
    {
        e.preventDefault();
        
        // This url will go inside the .env file
        var url = 'http://localhost:3500/register';
        
        // Making an api post with the 'inputs' object to register it into the database 
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
                <h2>Register below</h2>
                <form className="form" onSubmit={handleClick}>
                    <input name="username" value={inputs.username} onChange={handleTyping} placeholder="Username"></input>
                    <input name="password" type="password" value={inputs.password} onChange={handleTyping} placeholder="Password"></input>
                    <button type="submit" className="login-page-button">Submit</button>
                    <p>Already a user? <Link to="/login">Login</Link> </p>
                </form>
            </div>
        </div>
    )
}

export default RegisterPage;