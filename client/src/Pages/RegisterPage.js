import React from 'react';
import "./styles/LoginPage.scss";
const axios = require('axios');

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
        
        axios.post(url, inputs)
        .then((response) => 
        {
            if(response.status === 200)
            {
                props.handleSubmission(inputs.username);
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
                </form>
            </div>
        </div>
    )
}

export default RegisterPage;