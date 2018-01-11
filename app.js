const express = require('express')
const http = require('http');
const WebSocket = require('ws');

const app = express()

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

server.listen(5000, () => {
  console.log('Listening on port 5000...')
});
