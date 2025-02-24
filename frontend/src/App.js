import React, { useState, useEffect, useRef } from "react";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);
  const roomName = "testroom";

  useEffect(() => {
    const connectWebSocket = () => {
      socketRef.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${roomName}/`);

      socketRef.current.onopen = () => {
        console.log("WebSocket Connected");
        setSocketConnected(true);
      };

      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Received message:", data); // Debug log
        setMessages((prevMessages) => [...prevMessages, data.message]);
      };

      socketRef.current.onclose = (event) => {
        console.log("WebSocket Disconnected", event.code, event.reason);
        setSocketConnected(false);
        // Attempt to reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };

      socketRef.current.onerror = (error) => {
        console.error("WebSocket Error:", error);
      };
    };

    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [roomName]);

  const sendMessage = (e) => {
    e.preventDefault(); // Prevent form submission
    if (message.trim() && socketRef.current) {
      const messageData = {
        type: 'message',
        message: message
      };
      socketRef.current.send(JSON.stringify(messageData));
      setMessage(""); // Clear input after sending
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">DjangoChatify</h1>
      <div className="w-full max-w-md p-4 bg-white shadow-md rounded-lg">
        <div className="h-60 overflow-y-auto border-b border-gray-300 p-2">
          {messages.map((msg, index) => (
            <div key={index} className="p-2 bg-gray-200 my-1 rounded">
              {msg}
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} className="flex mt-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 p-2 border rounded-l"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className={`px-4 py-2 rounded-r ${socketConnected ? 'bg-blue-500' : 'bg-gray-400'
              } text-white`}
            disabled={!socketConnected}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
