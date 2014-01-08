var ws_address = "59.78.3.89";
var ws_port = ":8888";


var ws = new WebSocket("ws://" + ws_address+ws_port);


var p = document.getElementById("message");

var interval = 0;
var time_interval = 10 * 1000;

ws.onopen = function(){

    
    console.log("apply done");
    getServer();
    interval = setInterval(getServer,time_interval);

};
    
ws.onmessage = function(e){
    var json = e.data;
    var array = JSON.parse(json);
    if(array[0].id == "none")
	return;
    else
	{
	    var len = array.length;
	    var x = Math.floor(Math.random() * len);
	    p.innerHTML = array[x].id + " is broadcasting  "
		+ array[x].num + " number";
	}
};

ws.onclose = function(){
    if(interval != 0)
	clearInterval(interval);
}
    

function getServer(){

    ws.send(JSON.stringify({"eventName":"message"}));

}
