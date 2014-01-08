function catchScreen(){
	var video = document.getElementById("video");
	var canvas = document.getElementById("canvas");

	var c = canvas.getContext("2d");
	c.drawImage(video, 0, 0, canvas.width, canvas.height);
	console.log("draw done");

//	c.drawImage(video,0,0,canvas.width,canvas.height);
}

function upload(){
	
	catchScreen();
	var canvas = document.getElementById("canvas");
	var request = new XMLHttpRequest();
	request.open("POST","localhost:8888/upload");
	request.setRequestHeader("Content-Type",
				"application/x-www-form-urlencoded");
	var data = {};
	data.imgname = "wxd";
	data.imgdata = canvas.toDataURL();
	request.send(encodeFormData(data));

}


function encodeFormData(data){
	var pairs = [];
	if(!data)
		return "";
	for(var name in data){
		if(!data.hasOwnProperty(name))
			continue;
		if(typeof data[name] === "function")
			continue;
		var value = data[name].toString();
		name = encodeURIComponent(name.replace("%20","+"));
		value = encodeURIComponent(value.replace("%20","+"));
		pairs.push(name+"="+value);
		
	}
	return pairs.join('&');

}