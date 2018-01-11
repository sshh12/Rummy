const express = require('express')
const http = require('http');
const WebSocket = require('ws');
const Game = require('./game');

const app = express()

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const rummy = new Game(wss);

wss.on('error', () => console.log('*errored*'));
wss.on('close', () => console.log('*disconnected*'));

server.listen(5000, () => {
  console.log('Listening on port 5000...')
});
