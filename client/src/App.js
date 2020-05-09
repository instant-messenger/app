import React from 'react';
// import axios from 'axios';
import { Route, Switch } from 'react-router-dom';
import Nav from './components/Nav';
import RegisterPage from './Pages/RegisterPage';
import LoginPage from './Pages/LoginPage';
import ChatPage from './Pages/ChatPage';
import { withRouter } from 'react-router-dom';
import './App.scss';

function App() 
{
    // For small screens. This will collapse the contacts panel comp.
    return (
        <div className="App">
            <Nav />
            <Switch>
                <Route exact path="/login" component={(props) => <LoginPage {...props} />} />
                <Route exact path="/chat/" component={(props) => <ChatPage {...props} />} />
                <Route exact path="/" component={(props) => <RegisterPage {...props}/>} />
            </Switch>
        </div>
    );
}

export default withRouter(App);
