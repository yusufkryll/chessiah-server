module.exports = class Rooms
{
    constructor(network)
    {
        this.network = network;
        this.rooms = [];
    }
    Get = (index) =>
    {
        return this.rooms[index];
    }
    JoinRandom = (client) =>
    {
        for(var index in this.rooms)
        {
            var room = this.rooms[index];
            for(var p in room.players)
            {
                var player = room.players[p];
                if(player.id == client.id) return;
            }
            console.table(room.players);
            if(Object.keys(room.players).length < room.roomStartLength)
            {
                this.rooms[index].players.push({client});
                client.join(index.toString());
                client.send("find-game");
                if(Object.keys(room.players).length >= room.roomStartLength)
                {
                    client.send("spawn", null, 1);
                    this.network.onRoomStarted(room);
                }
                return;
            }
        }
        var roomToJoin = this.CreateRoom();
        this.rooms[roomToJoin].players.push({client});
        client.join(roomToJoin.toString());
        client.send("find-game");
    }
    CreateRoom = (obj) =>
    {
        var defaultRoomProperties = {
            name: "NewRoom",
            roomStartLength: 2,
            players: []
        };
        var index = this.rooms.push(obj || defaultRoomProperties) - 1;
        return index;
    }
}