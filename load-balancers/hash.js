const http = require('http');
const crypto = require('crypto');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});

const startPort = 5000;
const endPort = 5007;

// Hash Based Routing Selection Algorithm
const servers = Array.from({ length: endPort - startPort + 1 }, (_, i) => `http://localhost:${startPort + i}`);

// For testing
// Generate an array of 10 random IPs
const randomIps = Array.from({ length: 10 }, () => generateRandomIp());

// Function to generate a random IP
function generateRandomIp() {
  return `${randomByte()}.${randomByte()}.${randomByte()}.${randomByte()}`;
}

// Helper function to get a random number between 0-255
function randomByte() {
  return Math.floor(Math.random() * 256);
}

// Fetch a random IP from the array
function getRandomIp() {
  return randomIps[Math.floor(Math.random() * randomIps.length)];
}

// Simple hashing function for IP
const hashIp = (ip) => {
  return parseInt(crypto.createHash('md5').update(ip).digest('hex').slice(0, 8), 16);
};

const getTargetServerHashBasedRouting = (ip) => {
  if (!ip) return servers[0]; // Fallback if IP is unavailable

  const hashedValue = hashIp(ip);
  return servers[hashedValue % servers.length]; // Consistent server selection
};

console.log(servers);

const server = http.createServer((req, res) => {
  // const clientIp = req.connection.remoteAddress || req.socket.remoteAddress;
  const clientIp = getRandomIp();
  console.log({ clientIp });
  const targetServer = getTargetServerHashBasedRouting(clientIp);

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
