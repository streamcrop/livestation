//This class is the main class of the room pool
//Room pool is avaliable when the sockets come and identify itself

exports.Room = Room;
exports.RoomPool = RoomPool;

//every room consists of one master and arbitrary clients 
function Room(master,pool){
	
	this.room_pool = pool;//link back to the pool for the pool
	//necessary when the master stops living
	master.room = this;
	//link back to the room for the master
	//necessary when the master stops living
	master.on("message",this.masterCallBack);
	master.on("close",this.masterCloseCallBack);
	
	//change the callbacks to handle new events
	this.master = master;
	this.clients = new Array(0);
	
	//The belowing variables is necessary for dispatcher clients ids
	this.spareIndexs = new Array(0);
	this.initIndex = 0;
}

//when new client comes
Room.prototype.add = function(client){

	client.room = this;
	//change the client callbacks to handler new events
	client.on("message",this.clientCallBack);
	client.on("close",this.clientCloseCallBack);
	
	var id = this.getClientId();
	console.log("client get id "+id);
	this.clients[id] = client;
	
	//make the client sure that it has successfully enter the room
	client.send(JSON.stringify(
	{"eventName":"join_room_done"
	}
	));
	
}

Room.prototype.getClientId = function(){
	if(this.spareIndexs.length > 0)
		return this.spareIndexs.pop();
	else
		return this.initIndex++;
}
Room.prototype.emit = function(id,data){
	
	for(var i = 0;i < this.clients.length;++i){
		if(this.clients[i].id == id)
			this.clients[i].send(data);
	}
		
}

Room.prototype.masterCallBack = function(data){
	var json = JSON.parse(data);
	this.room.emit(json.socketId,data);
}

Room.prototype.clientCallBack = function(data){
	this.room.answer(this.id,data);
}

Room.prototype.masterCloseCallBack = function(){
	for(var i = 0;i < this.room.clients.length;++i){
		if(this.room.clients[i])
			this.room.clients[i].send(
				JSON.stringify({
					"eventName":"masterClose"
				})
				);
	}
	this.room.room_pool.clear();
}

Room.prototype.clientCloseCallBack = function(){
	var id = this.room.clients.indexOf(this);
	delete this.room.clients[id];
	this.room.spareIndexs.push(id);
}

Room.prototype.answer = function(id,data){
	var json = JSON.parse(data);
	json.socketId = id;
	this.master.send(JSON.stringify(json));
}

function RoomPool(func){
	this.pool = {};
	this.callback = func;
	console.log("func done");
}
	
RoomPool.prototype.onCreateRoom = function(master){
	this.pool[master.roomId] = new Room(master,this);
	console.log("create room done.");
}

RoomPool.prototype.onJoinRoom = function(client){
	var id = client.roomId;
	if(this.pool[id]){
		
		this.pool[id].add(client);
		console.log("add client done");
	}
}

RoomPool.prototype.clear = function(id){
	return (delete this.pool[id]);
}

RoomPool.prototype.test = function(){
	this.callback("hello");
}