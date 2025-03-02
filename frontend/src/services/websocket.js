class WebSocketService {
    constructor() {
        this.socket = null;
        this.reconnectAttempts = 0;
        this.MAX_RECONNECT_ATTEMPTS = 5;
    }

    connect(url) {
        return new Promise((resolve, reject) => {
            this.socket = new WebSocket(url);

            this.socket.onopen = () => {
                this.reconnectAttempts = 0;
                resolve();
            };

            this.socket.onerror = (error) => reject(error);
            this.socket.onclose = this.handleDisconnect.bind(this);
        });
    }

    handleDisconnect() {
        if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
            this.reconnectAttempts++;
            setTimeout(() => this.connect, 1000 * this.reconnectAttempts);
        }
    }

    sendMessage(message) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        }
    }

    disconnect() {
        this.socket?.close();
    }
}

const webSocketService = new WebSocketService();
export default webSocketService;
