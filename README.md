## TODOs:

- Serve Load Balancer at localhost:3000
- Servers via PM2 at localhost:5000..5007 - 8 cores
- Make CURL request to localhost:3000 > forwarded between localhost:5000 - localhost:5007
- Add health-checks to LB
- Add RR, weighted-RR, least-con, hash-based routing algos

## Flow:

- Open 2 terminal windows
- Install dependencies: `npm i`
- Boot up servers (as cpus available) > `pm2 start ecosystem.config.js`
  - Ports Available: localhost:5000-5007 (as defined in ecosystem config)
- Boot up load balancer > `node load-balancers/{algorithm type}`. Algorithm types:
  - round-robin.js
  - weighted-round-robin.js
  - least-connections.js
  - hash.js
- Make a cURL (GET) request to localhost:3000 > `curl -i http://localhost:3000`
  - For least connections > `ab -n 50 -c 10 http://localhost:3000`
- Separate health-check round-robin algo based load balancer
  - Boot up the load balancer using `node load-balancers/health-check-rr.js` and make a cURL request > `curl -i http://localhost:3000`
  - Performs an initial health-check
  - On healthy server found: Forwards the request in a RR fashion
  - If no healthy server: Sends a 503 - "No healthy servers available." response
  - Performs health-checks in every 10s interval for the list of servers
