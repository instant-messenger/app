import React from 'react';
import { Route } from 'react-router-dom';
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
            <Route exact path="/login" component={(props) => <LoginPage {...props}/>} />
            <Route exact path="/register" component={(props) => <RegisterPage {...props}/>} />
            <Route exact path="/chat" component={(props) => <ChatPage {...props}/>} />
        </div>
    );
}

export default App;
