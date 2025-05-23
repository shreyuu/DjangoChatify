import React, { useState, useEffect, useRef } from "react";
import WebSocketService from "../services/websocket";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        await WebSocketService.connect("ws://localhost:8000/ws/chat/");
        WebSocketService.socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setMessages((prev) => [...prev, data]);
        };
      } catch (error) {
        console.error("WebSocket connection failed:", error);
      }
    };

    connectWebSocket();
    return () => WebSocketService.disconnect();
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      WebSocketService.sendMessage({
        type: "chat_message",
        message: inputMessage,
      });
      setInputMessage("");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-slate-800 text-white p-4 shadow-md">
        <h2 className="text-xl font-semibold text-center">Chat Room</h2>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex flex-col max-w-[70%] ${msg.type === "chat_message"
              ? "ml-auto bg-blue-500 text-white"
              : "mr-auto bg-gray-200 text-gray-800"
              } rounded-lg p-3 shadow-sm`}
          >
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
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 active:scale-95 transition-colors duration-200"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
