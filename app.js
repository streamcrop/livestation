
var http = require('http');
var fs = require('fs');

var server = new http.Server();
server.listen(8000);

server.on("request",function(request,response){
		console.log("server received request");
    var url = require('url').parse(request.url);
    var filename = url.pathname.substring(1);
    var type ;
    switch(filename.substring(filename.lastIndexOf(".")+1)){
    case "html":
    case "htm":type = "text/html;charset=UTF-8";break;
    case "js" :type = "application/javascript;charset=UTF-8";break;
    case "css":type = "text/css;charset=UTF-8";break;
	
    }
    fs.readFile(filename,function(err,content){
	if(err){
	    response.writeHead(404,{
		"Content-Type":"text/plain;charset=UTF-8"});

	    response.write(err.message);
	    response.end();
	}
	else{
	    console.log("write done");
	    response.writeHead(200,{
		"Content-Type":type});
	    response.write(content);
	    response.end();
			       
	}
    });
});


var init_id = 0;
var webSocketServer  = require("ws").Server;
var Dispatcher = require("./Dispatcher.js").Dispatcher;
var RoomPool = require("./Room_pool.js").RoomPool;
var Room = require("./Room_pool.js").Room;

var server = new webSocketServer({port:8888});
var room_pool = new RoomPool();
var dispatcher = new Dispatcher(server,room_pool);
/*
var sockets = new Array();
var masterSocket;
var masterCome  = false;

server.on('connection',function(socket){
    socket.id = id();
    if(!masterCome){
	masterSocket = socket;
	console.log("master come\n");
	masterSocket.on("message",function(data){
	  
	    var json = JSON.parse(data);
	    for(var i = 0;i < sockets.length;++i){
		if(sockets[i] && (sockets[i].id == json.socketId))
		    sockets[i].send(data);
	    }
	});
	masterCome = true; 
    }
    else{
	console.log("client come");
	console.log("get Id: "+socket.id);
	socket.on("message",function(data){
	    console.log("get message.\n");
	    var json = JSON.parse(data);
	    json.socketId = this.id;
	    masterSocket.send(JSON.stringify(json));
	    
	});

    
	socket.on("close",function(){
	    console.log("close " + i);
	    var i = sockets.indexOf(socket);
	    sockets.splice(i, 1);
	});
	sockets.push(socket);
    }
});


function id(){
    return init_id++;
}

*/
server.on("connection",function(socket){
	dispatcher.add(socket);
});
