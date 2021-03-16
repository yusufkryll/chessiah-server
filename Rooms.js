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
            var room = rooms[index];
            if(Object.keys(room.players).length < room.roomStartLength)
            {
                console.log("finded");
                client.join(index.toString());
                client.send("find-game");
                if(Object.keys(room.players).length >= room.roomStartLength)
                {
                    console.log("room starting...");
                    client.send("spawn");
                    return;
                }
            }
        }
        var roomToJoin = this.CreateRoom(client);
        this.rooms[roomToJoin].players.push(client.id);
        client.join(roomToJoin.toString());
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