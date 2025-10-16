require("dotenv").config();
const WebSocket = require("ws");
const axios = require("axios");

const wss = new WebSocket.Server({ port: 8080 });
const ADS_SERVICE_URL = process.env.ADS_SERVICE_URL;

let cachedAds = [];
let cachedAdminAds = [];

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
    const res = await axios.get(`${ADS_SERVICE_URL}/api/ads/all`);
    const newAds = res.data.data;

    if (JSON.stringify(newAds) !== JSON.stringify(cachedAds)) {
      cachedAds = newAds;
      broadcast({ action: "update", ads: cachedAds });
    }
  } catch (err) {
    console.log(ADS_SERVICE_URL);
    console.error("Error fetching ads:", err.message);
  }
}

async function fetchAdminAds() {
  try {
    const res = await axios.get(`${ADS_SERVICE_URL}/api/ads/pending`, {
      headers: {
        "x-ads-key": process.env.SECRET_ADS_KEY,
      },
    });

    const newAdminAds = res.data.data;

    if (JSON.stringify(newAdminAds) !== JSON.stringify(cachedAdminAds)) {
      cachedAdminAds = newAdminAds;
      broadcast({ action: "adminUpdate", ads: cachedAdminAds });
    }
  } catch (err) {
    console.error("Error fetching admin ads:", err.message);
  }
}

// On client connection
wss.on("connection", (ws) => {
  console.log("Client connected");
  ws.send(
    JSON.stringify({
      action: "init",
      ads: cachedAds || [],
      adminAds: cachedAdminAds || [],
    })
  );

  ws.on("close", () => console.log("Client disconnected"));
});``

// Poll API every 1 second
setInterval(fetchAds, 1000);
setInterval(fetchAdminAds, 1000);

// Initial fetch
fetchAds();
fetchAdminAds();
