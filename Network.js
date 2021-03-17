module.exports = class Network
{
    constructor(port, events)
    {
        const Rooms = require('./Rooms');
        this.events = events;
        this.rooms = new Rooms(this);
        this.onConnect = () => { console.log("Connection successfully!") };
        this.onConnect = () => { console.log("Room started successfully!") };
        this.Start(port);
        this.WhenConnect(this.ConnectEvent);
        
    }
    ConnectEvent = (client) =>
    {
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
        this.SetEvents(client);
        this.onConnect(client);
    }
    WhenConnect = (callback) =>
    {
        this.io.on('connect', (client) => {
            callback(client);
        });
    }
    Start = (port) =>
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
    Listen = () =>
    {
        this.server.listen(this.port, () => {
            console.log('listening on *:' + this.port);
        });
    }
    SetEvents = (client) =>
    {
        var defaultEvents = {
            disconnect: data => {
                delete this.rooms[0].players[client];
                console.log('user disconnected');
            },
            'status-ping': data => {
                client.send('status-pong', data);
            },
            "find-game": data => {
                if(data == "transport close") return;
                console.log(data + " start to find game...");
                this.rooms.JoinRandom(client);
            },
        };
        this.events = {...this.events, ...defaultEvents};
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