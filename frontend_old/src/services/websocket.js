class WebSocketService {
    constructor() {
        this.socket = null;
        this.reconnectAttempts = 0;
        this.MAX_RECONNECT_ATTEMPTS = 5;
        this.listeners = new Map();
        this.connectionState = 'disconnected';
        this.messageQueue = [];
        this.debug = false;
    }

    get isConnected() {
        return this.connectionState === 'connected';
    }

    connect(url) {
        this.currentUrl = url;
        this.connectionState = 'connecting';
        return new Promise((resolve, reject) => {
            this.socket = new WebSocket(url);

            this.socket.onopen = () => {
                this.reconnectAttempts = 0;
                this.connectionState = 'connected';
                this.processPendingMessages();
                resolve();
            };

            this.socket.onerror = (error) => reject(error);
            this.socket.onclose = this.handleDisconnect.bind(this);
        });
    }

    handleDisconnect() {
        if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
            this.reconnectAttempts++;
            const backoffTime = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
            console.log(`Attempting to reconnect in ${backoffTime / 1000} seconds...`);
            setTimeout(() => this.connect(this.currentUrl), backoffTime);
        } else {
            console.error('Max reconnection attempts reached');
            this.emit('maxReconnectAttemptsReached');
        }
    }

    sendMessage(message) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            this.messageQueue.push(message);
            console.log('Message queued for later sending');
        }
    }

    processPendingMessages() {
        while (this.messageQueue.length > 0 && this.socket?.readyState === WebSocket.OPEN) {
            const message = this.messageQueue.shift();
            this.sendMessage(message);
        }
    }

    disconnect() {
        this.socket?.close();
    }

    addEventListener(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    }

    removeEventListener(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
    }

    log(...args) {
        if (this.debug) {
            console.log('[WebSocketService]', ...args);
        }
    }

    setDebug(enabled) {
        this.debug = enabled;
    }
}

const webSocketService = new WebSocketService();
export default webSocketService;
