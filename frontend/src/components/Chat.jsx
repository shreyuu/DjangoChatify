import React, { useState, useEffect, useRef } from "react";
import WebSocketService from "../services/websocket";
import UsernameSelection from "./UsernameSelection";
import UsersList from "./UsersList";

const Chat = () => {
  // Clear any existing username on component mount
  useEffect(() => {
    localStorage.removeItem("chatUsername");
    console.log("Cleared localStorage username");
  }, []);

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [username, setUsername] = useState(() => {
    const storedUsername = localStorage.getItem("chatUsername");
    console.log("Initial username from localStorage:", storedUsername);
    return storedUsername || "";
  });
  const [activeUsers, setActiveUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleUsernameSubmit = (newUsername) => {
    localStorage.setItem("chatUsername", newUsername);
    setUsername(newUsername);
  };

  useEffect(() => {
    if (!username) return;

    const connectWebSocket = async () => {
      try {
        await WebSocketService.connect("ws://localhost:8000/ws/chat/general/");
        setIsConnected(true);

        WebSocketService.socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === "user_list") {
            setActiveUsers(data.users);
          } else {
            setMessages((prev) => [...prev, data]);
          }
        };

        WebSocketService.socket.onclose = () => {
          setIsConnected(false);
          // Attempt to reconnect after 2 seconds
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 2000);
        };

        // Send username to server
        WebSocketService.sendMessage({
          type: "user_joined",
          username: username,
        });
      } catch (error) {
        console.error("WebSocket connection failed:", error);
        // Attempt to reconnect after 2 seconds
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 2000);
      }
    };

    connectWebSocket();

    return () => {
      WebSocketService.disconnect();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [username]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && isConnected) {
      WebSocketService.sendMessage({
        type: "chat_message",
        message: inputMessage,
        username: username,
      });
      setInputMessage("");
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const handleLogout = () => {
    localStorage.removeItem("chatUsername");
    setUsername("");
    setMessages([]);
    setActiveUsers([]);
    WebSocketService.disconnect();
  };

  if (!username) {
    console.log("Rendering UsernameSelection component");
    return <UsernameSelection onUsernameSubmit={handleUsernameSubmit} />;
  }

  console.log("Rendering main Chat component with username:", username);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar with Users List */}
      <div className="w-64 p-4 border-r border-gray-200 bg-white">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Logged in as:</span>
            <button
              onClick={handleLogout}
              className="text-xs text-red-500 hover:text-red-600"
            >
              Logout
            </button>
          </div>
          <div className="text-sm font-semibold text-gray-800">{username}</div>
        </div>
        <UsersList users={activeUsers} />
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="bg-slate-800 text-white p-4 shadow-md flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold">Chat Room</h2>
            <span className="text-sm bg-blue-600 px-3 py-1 rounded-full">
              @{username}
            </span>
          </div>
          <div className="space-x-2 flex items-center">
            {!isConnected && (
              <span className="text-xs text-red-400">Reconnecting...</span>
            )}
            <button
              onClick={clearChat}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            >
              Clear Chat
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col max-w-[70%] ${msg.username === username
                ? "ml-auto bg-blue-500 text-white"
                : "mr-auto bg-gray-200 text-gray-800"
                } rounded-lg p-3 shadow-sm`}
            >
              <div className="text-xs opacity-70 mb-1">
                {msg.username || "Anonymous"}
              </div>
              <div className="break-words">{msg.message}</div>
              <div className="text-xs opacity-70 text-right mt-1">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={sendMessage}
          className="flex gap-4 p-4 bg-white border-t border-gray-200"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!isConnected}
          />
          <button
            type="submit"
            className={`px-6 py-2 rounded-full transition-colors duration-200 ${isConnected
              ? "bg-blue-500 text-white hover:bg-blue-600 active:scale-95"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            disabled={!isConnected}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
