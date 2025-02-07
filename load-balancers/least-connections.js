const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});

const startPort = 5000;
const endPort = 5007;

// Least Connections Selection Algorithm
const servers = Array.from({ length: endPort - startPort + 1 }, (_, i) => ({
  url: `http://localhost:${startPort + i}`,
  connections: 0,
}));

const getTargetServerLeastConnections = () => {
  return servers.reduce((minServer, server) => (server.connections < minServer.connections ? server : minServer));
};

console.log(servers);

// Note: In a real world app, the methods to get active connections can vary.

const server = http.createServer((req, res) => {
  const targetServer = getTargetServerLeastConnections();
  targetServer.connections++;

  console.log(`Routing request to: ${targetServer.url} (Connections: ${targetServer.connections})`);

  proxy.web(req, res, { target: targetServer.url }, (err) => {
    if (err) {
      console.error('Proxy error:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Something went wrong.');
    }

    targetServer.connections--;
  });

  res.on('finish', () => {
    targetServer.connections--; // Decrement when response finishes
  });
});

server.listen(3000, () => {
  console.log('Load Balancer running on port 3000');
});
