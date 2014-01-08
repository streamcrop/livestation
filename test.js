var ws = new WebSocket('ws://'+'localhost'+':8888/');
ws.onopen = function(){
    console.log('connected to server done.');
	  ws.send(JSON.stringify( {
			"eventName":"client",
			"roomId":12
	  }));
}