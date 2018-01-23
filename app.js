const express = require('express')
const http = require('http');
const WebSocket = require('ws');
const Game = require('./game');

const app = express();

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const rummy = new Game(wss);

// Serve Static Files/Assets
app.use(express.static('public'));

// Ignore Socket Errors
wss.on('error', () => console.log('*errored*'));
wss.on('close', () => console.log('*disconnected*'));

/*----------------------ENDPOINTS----------------------*/
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/join/:lobby', (req, res) => {
  let code = req.params.lobby;
  if (rummy.addLobby(code)) {
    res.redirect('/game/' + req.params.lobby + '/' + rummy.lobbys[code].token);
  } else {
    res.redirect('/');
  }
});

app.get('/joincpu/:lobby', (req, res) => {
  let code = req.params.lobby;
  if (rummy.addLobby(code, cpu=true)) {
    res.redirect('/game/' + req.params.lobby + '/' + rummy.lobbys[code].token);
  } else {
    res.redirect('/');
  }
});

app.get('/game/:lobby/:token', (req, res) => {
  let code = "" + req.params.lobby,
      token = req.params.token;
  if (req.params.token && rummy.lobbys[code] && rummy.lobbys[code].token == token) {
    res.sendFile(__dirname + '/public/game.html');
  } else {
    res.redirect('/');
  }
});
/*-----------------------------------------------------*/

// Start Server
server.listen(5000, () => {
  console.log('Listening on port 5000...')
});
