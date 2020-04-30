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

    React.useEffect(() => {       
        async function getAuthenticationStatus()
        {
            const res = await axios.get("http://localhost:3500/isAuth/", 
            {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: "same-origin"
            }); 

            return res.data.status;
        }
            
        async function checkAuthentication()
        {
            const authenticationStatus = await getAuthenticationStatus();

            if(authenticationStatus === 200)
            {
                props.history.push('/chat');
            }
        }
        
        // Comment out the following line when styling chat page
        checkAuthentication();
        
    }, [props.history]);

    async function handleClick(e) 
    {
        e.preventDefault();

        // This url will go inside the .env file
        var url = 'http://localhost:3500/register';
        
        // Making an api post with the 'inputs' object to register it into the database 
        const res = await axios.post(url, inputs, 
        {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "same-origin"
        })
        
        if(res.data.status === 200)
        {
            props.history.push("/chat");
        }
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