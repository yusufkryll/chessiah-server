const http = require('http');
const express = require('express');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
let port = process.env.PORT || 3000;

var roomStartLength = 2;
var roomEndLength = 0;

const fps = 60;
const funcs = [];

const skip = Symbol('skip');
const start = Date.now();
let time = start;

const animFrame = () => {
  const fns = funcs.slice();
  funcs.length = 0;

  const t = Date.now();
  const dt = t - start;
  const t1 = 1e3 / fps;

  for(const f of fns)
    if(f !== skip) f(dt);

  while(time <= t + t1 / 4) time += t1;
  setTimeout(animFrame, time - t);
};

const requestAnimationFrame = func => {
  funcs.push(func);
  return funcs.length - 1;
};

const cancelAnimationFrame = id => {
  funcs[id] = skip;
};

animFrame();

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}

var rooms = [{
  name: "room1",
  bombPlanted: false,
  bombTime: 60,
  bombTimeCurrent: 0,
  players: []
}];

function JoinRoom(roomId, id, role)
{
  rooms[roomId].players[id] = id;
}

var getAllPlayers = (roomId, callback) => {
  for(room in rooms)
  {
    if(room == roomId.toString())
    {
      for(pi in rooms[room].players)
      {
        callback(rooms[room].players[pi]);
      }
    }
  }
};

io.on('connect', (client) => {
  client.username = "Yusuf";
  var roomName = "room1";
  var sira = 0;
  console.log(client.username + ' connected');
  client.emitV = function(name, data = null, type = 0){
    setTimeout(() => {
      switch (type) {
        case 0:
          client.emit(name, data);
          break;
        case 1:
          io.to("0").emit(name, data);
          break;
        default:
          break;
      }
    }, 1);
  };
  client.emitV("Give-Id", {
    id: client.id
  });
  client.roomNumber = 0;
  client.position = new Vector3(0,0,0);
  client.x = 0;
  client.y = 0;
  client.z = 0;
  client.on('disconnect', () => {
    delete rooms[0].players[client.id];
    console.log('user disconnected');
  });
  client.on('status-ping', (data) => {
    client.emitV('status-pong', data);
  });
  client.on('find-game', (data) => {
    console.log(data + " start to find game...");

    for(room in rooms)
    {
      if(Object.keys(rooms[room].players).length < roomStartLength)
      {
        rooms[room].players[client.id] = {};
        rooms[room].players[client.id].id = client.id;
        rooms[room].players[client.id].name = data;
        rooms[room].players[client.id].roomNumber = room;
        console.log("finded");
        client.join(room.toString());
        client.emitV('find-game');
        if(Object.keys(rooms[room].players).length >= roomStartLength)
        {
          console.log("room starting...");
          var types = [
            "Engineer",
            "Lead",
            "Impostor"
          ];
          shuffleArray(types);
          var i = 0;
          var ang = 360 / Object.keys(rooms[room].players).length;
          getAllPlayers(0, (player) => {
            console.log("he start");
            var x = Math.cos(ang * i) * 3;
            var z = Math.sin(ang * i) * 3;
            player.role = types[i];
            client.emitV("spawn", {
              id: player.id,
              name: player.name,
              role: player.role,
              x: x,
              y: 2,
              z: z
            }, 1);
            i++;
          });
        }
      }
    }
  });
  let returnToNet = (name) => {
    client.on(name, data => {
      client.emitV(name, data, 1);
    });
  }; 
  let Use = (obj) => {
    for (const name in obj) {
      var callback = obj[name];
      if(typeof callback === "function")
      {
        console.log("whi");
        client.on(name, data => {
          callback(data);
        });
        continue;
      }
      console.log("hi");
      returnToNet(name);
    }
  };
  Use({
    Instantiate: {},
  });
  client.on("MovePiece", data => {
    console.log(data);
    client.emitV("MovePiece", {
      id: data.id,
      x: data.x,
      y: data.y,
      z: data.z
    }, 1);
  });
  client.on("Instantiate", data => {
    client.emitV("Instantiate", data, 1);
  });
  client.on("chatmsg", data => {
    client.emitV("chatmsg", data, 1);
  });
  client.on('Kill', (d) => {
    client.emitV('Kill', d, 1);
  });
  const f = delta => {
    client.position.x += client.x * delta;
    client.position.y += client.y * delta;
    client.position.z += client.z * delta;
    requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
  client.on('positionSet', (data) => {
    client.emitV('positionSet', {
      id: client.id,
      x: data.x,
      y: data.y,
      z: data.z
    }, 1);
  });
});

server.listen(port, () => {
  console.log('listening on *:' + port);
});

class Vector3{
  constructor(x, y, z)
  {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}