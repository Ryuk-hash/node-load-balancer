const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});

const startPort = 5000;
const endPort = 5007;

// Weighted Roud Robin Selection Algorithm
const servers = Array.from({ length: endPort - startPort + 1 }, (_, i) => ({
  url: `http://localhost:${startPort + i}`,
  weight: Math.floor(Math.random() * 8),
  currentWeight: 0,
}));

const getTargetServerWeightedRR = () => {
  let selectedServer = null;
  let totalWeight = 0;

  servers.forEach((server) => {
    server.currentWeight += server.weight;
    totalWeight += server.weight;

    if (!selectedServer || server.currentWeight > selectedServer.currentWeight) selectedServer = server;
  });

  if (selectedServer) {
    selectedServer.currentWeight -= totalWeight;
    return selectedServer.url;
  }

  // Fallback (should never happen)
  return servers[0].url;
};

console.log(servers);

const server = http.createServer((req, res) => {
  const targetServer = getTargetServerWeightedRR();
  console.log(servers);

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
});
