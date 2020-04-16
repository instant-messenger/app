import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Nav from './components/Nav';
import RegisterPage from './Pages/RegisterPage';
import LoginPage from './Pages/LoginPage';
import ChatPage from './Pages/ChatPage';
import './App.scss';

function App() 
{
    return (
        <div className="App">
            <Nav />
            <Switch>
                <Route exact path="/login" component={(props) => <LoginPage {...props}/>} />
                <Route exact path="/chat/:id" component={(props) => <ChatPage {...props}/>} />
                <Route exact path="/" component={(props) => <RegisterPage {...props}/>} />
            </Switch>
        </div>
    );
}

export default App;
