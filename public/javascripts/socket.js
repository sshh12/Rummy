
var socket = new WebSocket("ws://127.0.0.1:5000");

socket.onopen = (event) => {

  console.log("Connected.");

  window.addEventListener('beforeunload', () => {
    socket.close();
  });

};

socket.onmessage = (message) => {
  console.log(JSON.parse(message.data));
  socket.ondata(JSON.parse(message.data));
}

let send = (data) => {
  socket.send(JSON.stringify(data));
}

let getLobbyStatus = (code) => {

  send({
    'cmd': 'status',
    'lobby': code
  });

};
