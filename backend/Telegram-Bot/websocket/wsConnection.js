const WebSocket = require("ws");

class WebSocketConnection {
  constructor(url = "ws://localhost:8080") {
    this.url = url;
    this.ws = null;
    this.isConnected = false;
    this.reconnectInterval = 5000;
    this.maxReconnectAttempts = 10;
    this.reconnectAttempts = 0;
    this.messageHandlers = new Map();
  }

  connect() {
    try {
      console.log("🔄 Connecting to WebSocket...");
      this.ws = new WebSocket(this.url);

      this.ws.on("open", () => this.handleOpen());
      this.ws.on("message", (data) => this.handleMessage(data));
      this.ws.on("close", () => this.handleClose());
      this.ws.on("error", (error) => this.handleError(error));
    } catch (error) {
      console.error("❌ WebSocket connection failed:", error.message);
      this.scheduleReconnect();
    }
  }

  handleOpen() {
    console.log("🔗 Connected to WebSocket successfully");
    this.isConnected = true;
    this.reconnectAttempts = 0;

    // Identify as Telegram bot
    this.send({ type: "telegram_bot" });
  }

  handleMessage(data) {
    try {
      const message = JSON.parse(data);
      console.log(`📨 Received: ${message.action}`);

      // Call registered handlers
      if (this.messageHandlers.has(message.action)) {
        const handler = this.messageHandlers.get(message.action);
        handler(message);
      }
    } catch (error) {
      console.error("❌ Error parsing message:", error);
    }
  }

  handleClose() {
    console.log("❌ WebSocket closed");
    this.isConnected = false;
    this.scheduleReconnect();
  }

  handleError(error) {
    console.error("❌ WebSocket error:", error.message);
    this.isConnected = false;
  }

  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("❌ Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `🔄 Reconnecting in ${this.reconnectInterval / 1000}s... (${
        this.reconnectAttempts
      }/${this.maxReconnectAttempts})`
    );

    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  // Register message handler
  onMessage(action, handler) {
    this.messageHandlers.set(action, handler);
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
      return true;
    } else {
      console.warn("⚠️ WebSocket not connected");
      return false;
    }
  }

  disconnect() {
    if (this.ws) {
      console.log("🔌 Disconnecting WebSocket...");
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  getStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      url: this.url,
    };
  }
}

module.exports = WebSocketConnection;
