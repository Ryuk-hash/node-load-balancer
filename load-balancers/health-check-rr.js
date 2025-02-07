const http = require('http');
const httpProxy = require('http-proxy');
const axios = require('axios');

const proxy = httpProxy.createProxyServer({});

const startPort = 5006;
const endPort = 5015; // except 5006, 5007 - all should return unhealthy

// Health Check Mechanism
const servers = Array.from({ length: endPort - startPort + 1 }, (_, i) => ({
  url: `http://localhost:${startPort + i}`,
  isHealthy: true,
}));

const checkServerHealth = async () => {
  for (const server of servers) {
    try {
      const response = await axios.get(`${server.url}/health`, { timeout: 2000 });
      server.isHealthy = response.status === 200;
    } catch (err) {
      server.isHealthy = false;
    }
  }

  console.log('Updated Server Health:', servers);
};

setInterval(checkServerHealth, 10000); // run health check every 10s

// Select a healthy server using Round-Robin
let currentRR = 0;

const getHealthyServerRR = () => {
  const healthyServers = servers.filter((server) => server.isHealthy);
  if (healthyServers.length === 0) return null; // No healthy servers available

  const targetServer = healthyServers[currentRR % healthyServers.length];
  currentRR = (currentRR + 1) % healthyServers.length;

  return targetServer.url;
};

const server = http.createServer((req, res) => {
  const targetServer = getHealthyServerRR();
  if (!targetServer) {
    res.writeHead(503, { 'Content-Type': 'text/plain' });
    return res.end('No healthy servers available.');
  }

  console.log(`Routing request to: ${targetServer}`);

  proxy.web(req, res, { target: targetServer }, (err) => {
    if (err) {
      console.error('Proxy error:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Something went wrong.');
    }
  });
});

server.listen(3000, () => {
  console.log('Load Balancer running on port 3000');
  checkServerHealth(); // Initial health check
});
