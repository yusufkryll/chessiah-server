module.exports = class Rooms
{
    constructor()
    {
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
                var playerID = room.players[p];
                if(playerID == client.id) return;
            }
            if(Object.keys(room.players).length < room.roomStartLength)
            {
                this.rooms[index].players.push(client.id);
                client.join(index.toString());
                client.send("find-game");
                if(Object.keys(room.players).length >= room.roomStartLength)
                {
                    client.send("spawn", null, 1);
                }
                return;
            }
        }
        var roomToJoin = this.CreateRoom();
        this.rooms[roomToJoin].players.push(client.id);
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