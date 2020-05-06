import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Route, Switch } from 'react-router-dom';
import Nav from './components/Nav';
import RegisterPage from './Pages/RegisterPage';
import LoginPage from './Pages/LoginPage';
import ChatPage from './Pages/ChatPage';
import { withRouter } from 'react-router-dom';
import './App.scss';

function App(props) {
    const [ user, setUser ] = useState({});

    useEffect(() => {
        console.log(props)
        axios.get("http://localhost:3500/isAuth/", {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "same-origin"
        }).then((response) => {
            console.log(response)
            if(response.status === 200) {
                props.history.push("/chat");
            } 
        }).catch((error) => {
            console.log(error)
        })
    }, [])

    return (
        <div className="App">
            <Nav />
            <Switch>
                <Route exact path="/login" component={(props) => <LoginPage {...props}/>} />
                <Route exact path="/chat/" component={(props) => <ChatPage {...props}/>} />
                <Route exact path="/" component={(props) => <RegisterPage {...props}/>} />
            </Switch>
        </div>
    );
}

export default withRouter(App);
