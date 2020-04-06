import React from 'react';
import { Link } from 'react-router-dom';
import "./styles/LoginPage.scss";

function LoginPage(props)
{
    const [inputs, setInputs] = React.useState({
        username: "",
        password: "",
    });

    function handleClick(e) {
        e.preventDefault();
        props.handleSubmission(inputs.username);
        props.history.push('/chat')
        console.log('Login props', props)
    }

    function handleTyping(e) {
        e.preventDefault();
        console.log(e.target.value)
        setInputs({...inputs, [e.target.name]: e.target.value});
    }

    return(
        <div className="container">
            <div className="form-container">
                <h2>Login below</h2>
                <form className="form">
                    <input name="username" value={inputs.username} onChange={handleTyping} placeholder="Username"></input>
                    <input name="password" type="password" value={inputs.password} onChange={handleTyping} placeholder="Password"></input>
                    <button className="login-page-button" onClick={handleClick} to="/chat">Submit</button>
                </form>
            </div>
        </div>
    )
}

export default LoginPage;