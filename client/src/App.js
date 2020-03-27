import React, { useState, useEffect } from 'react';
import { Route } from 'react-router-dom';
import io from "socket.io-client";
import LoginPage from './Pages/LoginPage';
import ChatPage from './Pages/ChatPage';
import './App.css';
import Nav from './components/Nav';

// Components

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
      <h1>This is the client side</h1>
      {userName ? <p>Welcome {userName}</p> : null}
        <Route exact path="/login" component={() => <LoginPage handleSubmission={handleUserNameSubmission} />} />
        <Route exact path="/dashboard" component={() => < ChatPage userSocket={userSocket} />} />
    </div>
  );
}

export default App;
