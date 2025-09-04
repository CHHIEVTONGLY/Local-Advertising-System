const WebSocket = require("ws");
const axios = require("axios");

const wss = new WebSocket.Server({ port: 8080 });

let cachedAds = [];

// Broadcast to all clients
function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Fetch ads from your existing API
async function fetchAds() {
  try {
    const res = await axios.get("http://localhost:3002/api/ads/all");
    const newAds = res.data.data;

    if (JSON.stringify(newAds) !== JSON.stringify(cachedAds)) {
      cachedAds = newAds;
      broadcast({ action: "update", ads: cachedAds });
    }
  } catch (err) {
    console.error("Error fetching ads:", err.message);
  }
}

// On client connection
wss.on("connection", (ws) => {
  console.log("Client connected");
  ws.send(JSON.stringify({ action: "init", ads: cachedAds }));

  ws.on("close", () => console.log("Client disconnected"));
});

// Poll API every 1 second
setInterval(fetchAds, 1000);

// Initial fetch
fetchAds();
