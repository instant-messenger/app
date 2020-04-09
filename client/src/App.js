import React, { useState, useEffect } from 'react';
import { Route } from 'react-router-dom';
import io from "socket.io-client";
import LoginPage from './Pages/LoginPage';
import ChatPage from './Pages/ChatPage';
import RegisterPage from './Pages/RegisterPage';
import './App.scss';
import Nav from './components/Nav';

function App() 
{
    const [userSocket, setSocket] = useState();
    const [userName, setUserName] = useState();

    function handleUserNameSubmission(name)
    {
        setUserName(name);
        
        // 'name' can be passed to server the following way
        userSocket.emit('login', name);
    }

    useEffect(() => {
      // We only need to initialize io('URL') only once.
      // If io('URL') is called again, a new socket ID will be created.
      // If you need to emit an event on another component, pass 'userSocket' as a prop."
      const socket = io('http://localhost:3500/');
      setSocket(socket);

      socket.on("connection");

}, []);

return (
    <div className="App">
        <Nav />
        {userName ? <p>Welcome {userName}</p> : null}
        <Route exact path="/login" component={(props) => <LoginPage handleSubmission={handleUserNameSubmission} {...props}/>} />
        <Route exact path="/register" component={(props) => <RegisterPage handleSubmission={handleUserNameSubmission} {...props}/>} />
        <Route exact path="/chat" component={() => <ChatPage userSocket={userSocket} userName={userName} />} />
    </div>
  );
}

export default App;
