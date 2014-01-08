/*This file is the dispatcher for the communication server.
  Basic functionalities:
	1.Accept sockets when they connected the server.
	2.Dispatcher them when received acknowledgements.
  
 */
 
 //Dispatcher will dispatcher sockets to rooms based on their message
 exports.Dispatcher = Dispatcher;
 function Dispatcher(ws_server,room_pool){
	this.server = ws_server;
	this.sockets = new Array(0);
	this.room_pool = room_pool;
	this.id = 12;
//	this.room_pool = room_pool;
 }
 
 Dispatcher.prototype.masterCallBack = function(socket){
	this.room_pool.onCreateRoom(socket);
}
 Dispatcher.prototype.clientCallBack = function(socket){
	this.room_pool.onJoinRoom(socket);
	}
 Dispatcher.prototype.initCallBack = function(data){
	var json = JSON.parse(data);
	switch(json.eventName){
		case "master":
			console.log("master come");
			this.roomId = json.roomId;
			this.dispatcher.masterCallBack(this);
			break;
		case "client":
			this.roomId = json.roomId;
			console.log("client come");
			this.dispatcher.clientCallBack(this);
			break;
	}
	var index = this.dispatcher.sockets.indexOf(this);
	this.dispatcher.sockets.splice(index, 1);

 }
Dispatcher.prototype.closeCallBack = function(){
	//
	var index = this.dispatcher.sockets.indexOf(this);
	this.dispatcher.sockets.splice(index, 1);	
}
	
 
 
 Dispatcher.prototype.add = function(socket){
	socket.dispatcher = this;
	this.sockets.push(socket);
	console.log(this.sockets.length);
	socket.on("message",this.initCallBack);
	socket.on("close",this.closeCallBack);
 }
 
 