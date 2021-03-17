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
            if(Object.keys(room.players).length < room.roomStartLength)
            {
                console.log("finded");
                this.rooms[index].players.push(client.id);
                client.join(index.toString());
                client.send("find-game");
                console.table(this.rooms);
                if(Object.keys(room.players).length >= room.roomStartLength)
                {
                    console.log("room starting...");
                    client.send("spawn");
                }
                return;
            }
        }
        console.log("hello");
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