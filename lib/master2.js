var PeerConnection = (window.PeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection || window.mozRTCPeerConnection);
var URL = (window.URL || window.webkitURL || window.msURL || window.oURL);
var getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
var nativeRTCIceCandidate = (window.mozRTCIceCandidate || window.RTCIceCandidate);
var nativeRTCSessionDescription = (window.mozRTCSessionDescription || window.RTCSessionDescription); // order is very important: "RTCSessionDescription" defined in Nighly but useless


//----utilities------------
var eventHandler = {};
function on(eventName,func){eventHandler[eventName] = func;};
function fire(eventName,arg){(eventHandler[eventName])(arg);};

//-------------------------

//---constants-------------
var sdpConstraints = {
  'mandatory': {
    'OfferToReceiveAudio': true,
    'OfferToReceiveVideo': true
  }
};
//var roomId = 12;
var ws_address = "59.78.3.89";
//var ws_address = "192.168.1.11";
var stun_server = "stun:stun.l.google.com:19302";
var video = document.getElementById("video");
var live_option = {"video": true, "audio":true};

var dataChannelConfig = {
    "optional": [{
      "RtpDataChannels": true
    }, {
      "DtlsSrtpKeyAgreement": true
    }]
};


//-------------------------

var peerConnections = new Array();
var init_peer_id = 0;
var free_peer_id = new Array(0);

function getFreePeerId(){
	if(free_peer_id.length > 0)
		return free_peer_id.shift();
	else
		return init_peer_id++;
}

console.log("act");
var streamToAttach;

getUserMedia.call(navigator, live_option, function(stream) {
    
    console.log("act done");
    video.src = URL.createObjectURL(stream);
    streamToAttach = stream;
//	catchScreen(video);
},function(){console.log("there is something wrong when get the stream");});	  

//-------------------------
//---communication layer---

var ws = new WebSocket('ws://'+ws_address+':8888/');
ws.onopen = function(){
    console.log('connected to server done.');
		register();
	  ws.send(JSON.stringify( {
			"eventName":"master",
			"roomId"  :roomId
	  }));
}



function register(){
	on("get_peer",init);
	on("send_answer",receive_answer);
	on("send_ice_candidate",receive_candidate);
}

ws.onmessage = function(e){

    var json = JSON.parse(e.data);
    switch(json.eventName){

    case "get_peer": 
	fire("get_peer",json);
	break;
    case "send_answer":
	fire("send_answer",json.data);
	break;
    case "send_ice_candidate":
	fire("send_ice_candidate",json.data);
	break;
    case "flowing":
//	peer.remote_flowing = true;
	break;
    }
}

//------------------------
//---hook functions-------

function init(data){

    //initatlize peer
    console.log("master initiliazed");
    var peer = new PeerConnection(
	{ "iceServers": [{ "url": stun_server }] },
	dataChannelConfig
    );
    peer.onicecandidate = onicecandidate;
    peer.onaddstream = onaddstream;
    peer.addStream(streamToAttach);
    peer.socketId = data.socketId;
    peer.remote_flowing = false;
    peerConnections.push(peer);
    console.log("peer.socketId: "+peer.socketId);
    //create offer

    peer.createOffer(function(session_description) {
	console.log("create offer by master.");
	peer.setLocalDescription(session_description);
	ws.send(JSON.stringify({
            "eventName": "send_offer",
            "data": {
		"sdp": session_description,
		"peerId":( getFreePeerId() )
            },
	    "socketId":peer.socketId
	    
	}));
	
	console.log("create offer done.");
    }, null, sdpConstraints);
    
    
}

function receive_answer(data){
    console.log("got answer.\n");
    var peerId = data.peerId;
    var peer = peerConnections[peerId];
    peer.setRemoteDescription(new RTCSessionDescription(data.sdp));    
    
}

function receive_candidate(data){
    console.log("receiver ice candidate.");
    var peerId = data.peerId;
    var peer = peerConnections[peerId];

    peer.addIceCandidate(new RTCIceCandidate({
	sdpMLineIndex: data.sdpMLineIndex,
	candidate: data.candidate
    }));
    console.log("add done.\n");
}    


//------------------------

function onicecandidate(event){
    
    if(this.remote_flowing){
	console.log("remote flowing,so no need to send ice candidate.");
	return;
    }
    if (!this || !event || !event.candidate ) {
	console.log("error,not excepted.\n");
	
	return ;
    }
    console.log("on ice candidate generated done.");
    var candidate = event.candidate;
    ws.send(JSON.stringify({
        "eventName": "send_ice_candidate",
        "data": {
            "label": event.candidate.sdpMLineIndex,
            "candidate": event.candidate.candidate,
        },
	"socketId":this.socketId
	
    }));
}
    



function onaddstream(){
    
    //on adda remote stream
    //no need for master
}


//------------------------


