const express = require('express');
const url = require('url');

const app = express();
const APP_PORT = process.env.APP_PORT;
console.log(APP_PORT);

function fullUrl(req) {
  return url.format({ protocol: req.protocol, host: req.get('host'), pathname: req.originalUrl });
}

app.get('/', (req, res) => {
  return res.send(`PORT: ${APP_PORT}`);
});

app.get('/health', (req, res) => {
  return res.send(`Reachable!`);
});

// Handling undefined routes
app.all('*', (req, res, next) => {
  return res.send(`URL ${fullUrl(req)} not found.`);
});

app.listen(APP_PORT, (err) => {
  if (err) console.error(err);
  else console.log(`Listening on PORT: ${APP_PORT}`);
});
