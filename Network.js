module.exports = class Network
{
    constructor(port, events)
    {
        const Rooms = require('./Rooms');
        this.events = events;
        this.rooms = new Rooms();
        this.onConnect = () => { console.log("Connection successfully!") };
        this.Start(port);
        this.WhenConnect(this.ConnectEvent);
        
    }
    ConnectEvent(client)
    {
        this.SetEvents(client);
        client.when = (name, callback) => {
            client.on(name, callback);
        };
        client.send = (name, data = null, type = 0) => {
            setTimeout(() => {
                switch (type) {
                  case 0:
                    client.emit(name, data);
                    break;
                  case 1:
                    this.io.to("0").emit(name, data);
                    break;
                  default:
                    break;
                }
            }, 1);
        };
        this.onConnect(client);
    }
    WhenConnect(callback)
    {
        this.io.on('connect', (client) => {
            callback(client);
        });
    }
    Start(port)
    {
        const http = require('http');
        const express = require('express');
        const socketIo = require('socket.io');
        const app = express();
        this.server = http.createServer(app);
        this.io = socketIo(this.server);
        this.port = port;
        this.Listen();
    }
    Listen()
    {
        this.server.listen(this.port, () => {
            console.log('listening on *:' + this.port);
        });
    }
    SetEvents(client)
    {
        this.events += {
            disconnect: data => {
                delete this.rooms[0].players[client.id];
                console.log('user disconnected');
            },
            'status-ping': data => {
                client.send('status-pong', data);
            },
            "find-game": data => {
                console.log(data + " start to find game...");
                this.rooms.JoinRandom(client);
            },
        };
        for (const name in this.events) {
            var callback = this.events[name];
            if(typeof callback === "function")
            {
              client.when(name, data => {
                callback(data);
              });
              continue;
            }
            client.when(name, data => {
                client.send(name, data, 1);
            });
        }
    }
}