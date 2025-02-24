import { useState, useEffect, useRef, useCallback } from 'react';

const useWebSocket = (url, options = {}) => {
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const wsRef = useRef(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = options.maxAttempts || 5;
    const baseDelay = options.baseDelay || 1000;

    const connect = useCallback(() => {
        try {
            wsRef.current = new WebSocket(url);

            wsRef.current.onopen = () => {
                console.log('WebSocket Connected');
                setIsConnected(true);
                setError(null);
                reconnectAttempts.current = 0;
            };

            wsRef.current.onclose = (event) => {
                console.log('WebSocket Disconnected:', event.code);
                setIsConnected(false);

                if (reconnectAttempts.current < maxReconnectAttempts) {
                    const delay = Math.min(baseDelay * Math.pow(2, reconnectAttempts.current), 30000);
                    console.log(`Reconnecting in ${delay}ms...`);
                    setTimeout(() => {
                        reconnectAttempts.current += 1;
                        connect();
                    }, delay);
                } else {
                    setError('Maximum reconnection attempts reached');
                }
            };

            wsRef.current.onerror = (error) => {
                console.error('WebSocket Error:', error);
                setError('Connection error occurred');
            };

        } catch (err) {
            console.error('WebSocket Connection Error:', err);
            setError(err.message);
        }
    }, [url, maxReconnectAttempts, baseDelay]);

    useEffect(() => {
        connect();
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [connect]);

    const sendMessage = useCallback((message) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
        } else {
            console.error('WebSocket is not connected');
        }
    }, []);

    return {
        isConnected,
        error,
        sendMessage,
        reconnect: connect
    };
};

export default useWebSocket;
