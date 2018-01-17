let socket = new WebSocket("ws://127.0.0.1:5000");

let handle = {};

socket.onopen = (event) => {

  console.log("Connected.");

  window.addEventListener('beforeunload', () => {
    socket.close();
  });

};

socket.onmessage = (message) => {

  let data = JSON.parse(message.data);
  console.log(data);

  if (data.cmd in handle) {
    handle[data.cmd](data);
  }

}

let send = (data) => {
  socket.send(JSON.stringify(data));
}
