import React, { useState, useEffect } from 'react';
import WebSocketService from '../services/websocket';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');

    useEffect(() => {
        const connectWebSocket = async () => {
            try {
                await WebSocketService.connect('ws://localhost:8000/ws/chat/');
                WebSocketService.socket.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    setMessages(prev => [...prev, data]);
                };
            } catch (error) {
                console.error('WebSocket connection failed:', error);
            }
        };

        connectWebSocket();
        return () => WebSocketService.disconnect();
    }, []);

    const sendMessage = (e) => {
        e.preventDefault();
        WebSocketService.sendMessage({
            type: 'chat_message',
            message: inputMessage
        });
        setInputMessage('');
    };

    return (
        <div className="chat-container">
            <div className="messages">
                {messages.map((msg, index) => (
                    <div key={index} className="message">
                        {msg.message}
                    </div>
                ))}
            </div>
            <form onSubmit={sendMessage}>
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
};

export default Chat;