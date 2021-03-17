Array.prototype.shuffle = function () {
  let input = this;

  for (let i = input.length - 1; i >= 0; i--) {

    let randomIndex = Math.floor(Math.random() * (i + 1));
    let itemAtIndex = input[randomIndex];

    input[randomIndex] = input[i];
    input[i] = itemAtIndex;
  }
  return input;
}

const Network = require('./Network');

var port = process.env.PORT || 3000;

var events = {
  Instantiate: {},
  MovePiece: {},
};

var network = new Network(port, events);

network.onConnect = client => {
  const colors = ["white", "black"].shuffle();
  client.send("color");
};

network.onRoomStarted = room => {
  console.table(room);
  const colors = ["white", "black"].shuffle();
  room.players[0].send("color", colors[0]);
  room.players[1].send("color", colors[1]);
};
