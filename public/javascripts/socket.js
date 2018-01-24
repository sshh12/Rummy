/*
 * Socket Related Functions
 */

let socket = new WebSocket(window.location.href.replace('http', 'ws')); // Connect to socket @ same url as page

let handle = {}; // Store Handlers

socket.onopen = (event) => {

  console.log("Connected.");

  window.addEventListener('beforeunload', () => { // Attempts to Close Socket before forced disconnect
    socket.close();
  });

};

socket.onmessage = (message) => {

  let data = JSON.parse(message.data);
  console.log(data);

  if (data.cmd in handle) { // Choose and Execute Appropriate Handler
    handle[data.cmd](data);
  }

}

let send = (data) => { // Send Data (as string)
  socket.send(JSON.stringify(data));
}
