//------the room class ----------------------------
//-------------------------------------------------
function Room(roomId,master){
	this.roomId = roomId;
	this.master = master;
	this.lastId = 0;
	this.clients = new Array(0);
	this.free_ids = new Array(0);
}

Room.prototype.emit = function(id,data){
	for(var i = 0;i < this.clients.length;++i){
		if(this.clients[i] && this.clients[i].id == id)
			this.clients[i].send(data);
	}
}

Room.prototype.answer = function(id,data){
	var json = JSON.parse(data);
	data.socketId = id;
	this.master.send(JSON.stringify(json));
}

Room.prototype.getClientId = function(){
	if(free_ids.length > 0)
		return free_ids.shift();
	else
		return lastId++;
}

//-------------------------------------------------

//----------the room pool class--------------------

function Room_pool(){

	this.rooms = {};
	
}

Room_pool.prototype.create = function(master_socket){
	
	this.rooms[master_socket.roomId] = new Room(master_socket.roomId,master_socket);
	master_socket.room = this.rooms[master_socket.roomId];
	master_socket.on("message",function(data)){
		var json = JSON.parse(data);
		master_socket.room.emit(json.socketId,data);
	}
	master_socket.on("close",function(){
		
	});
}

Room_pool.prototype.attend = function(client){
	var room = this.rooms[client.roomId];
	if(!room)
		return;
	var clientId = getClientId();
	room.clients[clientId] = client;
	client.room = room;
	client.on("message",function(data){
		room.answer(client.id,data);
	});
	client.send("join_room_done");
	
}
//-------------------------------------------------