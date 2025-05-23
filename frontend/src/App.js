import React, { useState, useRef, useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import useWebSocket from "./hooks/useWebSocket";
import { IoSend } from "react-icons/io5";
import { format } from "date-fns";

const WS_URL = process.env.REACT_APP_WS_URL || "ws://127.0.0.1:8000";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [userId] = useState(Math.random().toString(36).substr(2, 9));
  const messagesEndRef = useRef(null);
  const roomName = "testroom";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        console.log("Received message:", data);

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
        console.error("Error parsing message:", error);
      }
    }
  }, [lastMessage, userId]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && isConnected) {
      const messageData = {
        type: "message",
        message: message,
        userId: userId,
        timestamp: new Date().toISOString(),
      };
      wssSendMessage(JSON.stringify(messageData));
      setMessage("");
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-64 bg-white border-r border-gray-200 flex-col">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-800">DjangoChatify</h1>
          </div>
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">Online</span>
            </div>
            {/* Add more sidebar content here */}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-800"># General</h2>
              <span className="text-sm text-gray-500">
                {messages.length} messages
              </span>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm ${
                isConnected
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {isConnected ? "Connected" : "Disconnected"}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-white p-6 space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.isSelf ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-6 py-4 ${
                    msg.isSelf
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="text-base break-words leading-relaxed">
                    {msg.text}
                  </p>
                  <span
                    className={`text-xs block mt-2 ${
                      msg.isSelf ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {format(new Date(msg.timestamp), "HH:mm")}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            <form
              onSubmit={sendMessage}
              className="flex items-center space-x-4"
            >
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 px-4 py-3 bg-gray-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-500"
                placeholder="Type your message..."
                disabled={!isConnected}
              />
              <button
                type="submit"
                className={`p-3 rounded-xl transition-all duration-200 ${
                  isConnected && message.trim()
                    ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                disabled={!isConnected || !message.trim()}
              >
                <IoSend className="w-6 h-6" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
