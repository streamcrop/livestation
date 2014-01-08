function Dispatcher(ws){
	this.ws = ws;
	this.count = 0;//how many sockets have come
	this.sockets = new Array();
	this.id = 73;
}

Dispatcher.prototype.add = function(socket){
	this.sockets.push(socket);
	this.count++;
	socket.on("message",this.init_callBack);
	console.log("add done");
}

Dispatcher.prototype.init_callBack = function(data){
	console.log(this.id);
	console.log('count',this.count);
}


var dispatcher = new Dispatcher(server);
server.on("connection",function(socket){
	socket.id = 0;
	dispatcher.add(socket);
});