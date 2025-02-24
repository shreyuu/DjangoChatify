import React, { useState } from "react";
import ErrorBoundary from './components/ErrorBoundary';
import useWebSocket from './hooks/useWebSocket';

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://127.0.0.1:8000';

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [userId] = useState(Math.random().toString(36).substr(2, 9)); // Simple user ID
  const roomName = "testroom";

  const {
    isConnected,
    sendMessage: wssSendMessage,
    lastMessage
  } = useWebSocket(`${WS_URL}/ws/chat/${roomName}/`, {
    maxAttempts: 5,
    baseDelay: 1000
  });

  React.useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data);
      setMessages(prevMessages => [...prevMessages, {
        id: Date.now(),
        text: data.message,
        timestamp: data.timestamp,
        isSelf: data.userId === userId
      }]);
    }
  }, [lastMessage, userId]);

  const sendMessage = (e) => {
    e.preventDefault(); // Prevent form submission
    if (message.trim() && isConnected) {
      const messageData = {
        type: 'message',
        message: message,
        userId: userId,
        timestamp: new Date().toISOString()
      };
      wssSendMessage(JSON.stringify(messageData));
      setMessage(""); // Clear input after sending
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">DjangoChatify</h1>
        <div className="w-full max-w-md p-4 bg-white shadow-md rounded-lg">
          <div className="h-60 overflow-y-auto border-b border-gray-300 p-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${msg.isSelf ? 'self' : 'other'}`}
              >
                <div className="message-content">
                  <p>{msg.text}</p>
                  <small className="text-gray-500">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </small>
                </div>
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
              className={`px-4 py-2 rounded-r ${isConnected ? 'bg-blue-500' : 'bg-gray-400'
                } text-white`}
              disabled={!isConnected}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
