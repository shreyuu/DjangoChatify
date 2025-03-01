import React, { useState } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import useWebSocket from "./hooks/useWebSocket";

const WS_URL = process.env.REACT_APP_WS_URL || "ws://127.0.0.1:8000";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [userId] = useState(Math.random().toString(36).substr(2, 9)); // Simple user ID
  const roomName = "testroom";

  const {
    isConnected,
    sendMessage: wssSendMessage,
    lastMessage,
  } = useWebSocket(`${WS_URL}/ws/chat/${roomName}/`, {
    maxAttempts: 5,
    baseDelay: 1000,
  });

  React.useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);
        console.log('Received message:', data); // Debug log

        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Date.now(),
            text: data.message,
            timestamp: data.timestamp,
            isSelf: data.userId === userId,
          },
        ]);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    }
  }, [lastMessage, userId]);

  const sendMessage = (e) => {
    e.preventDefault(); // Prevent form submission
    if (message.trim() && isConnected) {
      const messageData = {
        type: "message",
        message: message,
        userId: userId,
        timestamp: new Date().toISOString(),
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
          <div className="h-60 overflow-y-auto border-b border-gray-300 p-2 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isSelf ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${msg.isSelf
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                    }`}
                >
                  <p className="break-words">{msg.text}</p>
                  <span className={`text-xs ${msg.isSelf ? 'text-blue-100' : 'text-gray-500'
                    } block mt-1`}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={sendMessage} className="flex mt-4 gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Type a message..."
            />
            <button
              type="submit"
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${isConnected
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-400 cursor-not-allowed text-gray-200'
                }`}
              disabled={!isConnected}
            >
              Send
            </button>
          </form>
        </div>
        <div className={`fixed top-4 right-4 px-3 py-1 rounded-full text-sm ${isConnected
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
          }`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
