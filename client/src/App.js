import React, { useEffect } from 'react';
import socketIOClient from "socket.io-client";
import './App.css';

function App() {
  useEffect(() => {
    console.log("logging from App");
    const socket = socketIOClient("http://localhost:4000");
    socket.on("connection", data => console.log("data - ", data))
  }, [])

  return (
    <div className="App">
    </div>
  );
}

export default App;
