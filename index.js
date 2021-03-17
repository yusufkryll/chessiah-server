const Network = require('./Network');

var port = process.env.PORT || 3000;

var events = {
  Instantiate: {},
  MovePiece: {},
};

var network = new Network(port, events);

network.onConnect = playerData => {
  
};
