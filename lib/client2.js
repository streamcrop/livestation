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

var dataChannelConfig = {
    "optional": [{
      "RtpDataChannels": true
    }, {
      "DtlsSrtpKeyAgreement": true
    }]
  };
//var live_option = {"video": true, "audio":true};


//-------------------------
//client peer
var peer;

//-------------------------
//---communication layer---

var ws = new WebSocket('ws://'+ws_address+':8888/');
ws.onopen = function(){
 //   ws.send(JSON.stringify({"eventName":"get_peer"}));
		ws.send(JSON.stringify({"eventName":"client",
								"roomId"  :roomId}));
}


on("send_offer",init);
on("send_ice_candidate",receive_candidate);
ws.onmessage = function(e){

    var json = JSON.parse(e.data);
    switch(json.eventName){
	 case "join_room_done":
		ws.send(JSON.stringify({"eventName":"get_peer"}));
		break;
    case "send_offer":
	fire("send_offer",json.data);
	break;
    case "send_ice_candidate":
	fire("send_ice_candidate",json.data);
	break;
		case "masterClose":
			//handle the case then master is closed
			break;
    }
}

//------------------------
//---hook functions-------

function init(data){

    //initatlize peer
    console.log("client initilized");
    peer = new PeerConnection(
	{ "iceServers": [{ "url": stun_server }] },
	dataChannelConfig
    );
    peer.onicecandidate = onicecandidate;
    peer.onaddstream = onaddstream;
    peer.remotePeerId = data.peerId;
    //create offer
    
    peer.setRemoteDescription(new RTCSessionDescription(data.sdp));
    peer.createAnswer(
	function(session_description)
	{
	    peer.setLocalDescription(session_description);
	    ws.send(JSON.stringify({
		"eventName": "send_answer",
		"data": {
		    "sdp": session_description,
		    "peerId":peer.remotePeerId
		    
		}
	    }));
	    
	},null, sdpConstraints);
    
    
}

function receive_candidate(data){
    console.log("receiver ice candidate.\n");
    peer.addIceCandidate(new RTCIceCandidate({
	sdpMLineIndex: data.sdpMLineIndex,
	candidate: data.candidate
    }));
    console.log("add done.\n");
}    


//------------------------

function onicecandidate(event){
    if (!peer || !event || !event.candidate) {
	console.log("error,not excepted.\n");
	
	return ;
    }
    console.log("on ice candidate.");
    var candidate = event.candidate;
    ws.send(JSON.stringify({
        "eventName": "send_ice_candidate",
        "data": {
            "label": event.candidate.sdpMLineIndex,
            "candidate": event.candidate.candidate,
	    "peerId":peer.remotePeerId
        }
    }));
    console.log("on ice candidate send done.");
}
    



function onaddstream(event){
    
    //on adda remote stream
    console.log("on add remote stream");
    
    if(!event){
	    console.log("There is something wrong at on add stream.\n");
	return;
	
    }
    
    video.src=URL.createObjectURL(event.stream);   
    waitUntilRemoteStreamStartsFlowing();
}

function waitUntilRemoteStreamStartsFlowing()
{
    if (!(video.readyState <= HTMLMediaElement.HAVE_CURRENT_DATA 
        || video.paused || video.currentTime <= 0)){} 	
	     

}


//------------------------


