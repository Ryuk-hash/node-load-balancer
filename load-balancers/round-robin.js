const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});

const startPort = 5000;
const endPort = 5007;

// Roud Robin Selection Algorithm
let currentRR = 0;

const servers = Array.from({ length: endPort - startPort + 1 }, (_, i) => `http://localhost:${startPort + i}`);

const getTargetServerRR = () => {
  const targetUrl = servers[currentRR];
  currentRR = (currentRR + 1) % servers.length;
  return targetUrl;
};

console.log(servers);

const server = http.createServer((req, res) => {
  const targetServer = getTargetServerRR();

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
