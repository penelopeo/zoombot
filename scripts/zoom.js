var request = require('request');
var jwt = require('jsonwebtoken');

//authenticate with zoom api
function authenticate(){
	var payload = {
    iss: "XcwT-LfzQTWoxBgqcPy0xg",
    exp: ((new Date()).getTime() + 5000)
	};

	//Automatically creates header, and returns JWT
    var token = jwt.sign(payload, "VZXHLnhFTuMlRC6bZpxLSCbVyYSdtRSE0aiO");
    return token;
}

//start a meeting
function restart(roomId){
    var auth = authenticate();
    var options = {
        url: 'https://api.zoom.us/v2/rooms/'+ roomId +'/zrclient',
        headers: {
            Authorization: "Bearer "+ auth,
            "content-type": "application/json" 
        },
        json: {
            method: "restart"
        }
    }
    var temp;
    request.post(options, function(error, response, body){
        if(error)
            console.log('error:', error); 
        //console.log(response.body);
    });
}

//end a meeting
function end(roomId){
    var auth = authenticate();

    var options = {
        url: 'https://api.zoom.us/v2/rooms/'+ roomId +'/meetings',
        headers: {
            Authorization: "Bearer "+ auth,
            "content-type": "application/json" 
        },
        json: {
            method: "end"
        }
    }
    
    request.post(options, function(error, response){
        if(error)
            console.log('error:', error); 
        //console.log(response.body);
    });
}

//start a meeting
function join(roomId){
    var auth = authenticate();

    var options = {
        url: 'https://api.zoom.us/v2/rooms/'+ roomId +'/meetings',
        headers: {
            Authorization: "Bearer "+ auth,
            "content-type": "application/json" 
        },
        json: {
            method: "join"
        }
    }
    
    request.post(options, function(error, response){
        if(error)
            console.log('error:', error); 
        //console.log(response.body);
    });
}

function getRoomId(roomName){
    return new Promise(function(resolve, reject){
        var auth = authenticate();
        var options = {
            url: 'https://api.zoom.us/v2/rooms/zrlist',
            headers: {
                Authorization: "Bearer "+ auth,
                "content-type": "application/json" 
            },
            json: {
                method: "list", 
                params: { 
                    zr_name: roomName
                }
            }
        }
        
        request.post(options, function(error, response, body){
            if(error)
            {
                console.log('error:', error); 
                reject(error);
            } else {
            var id = body.result.data[0].zr_id;
            //console.log(id);
            resolve(id);
            }
        });    
    });
}


module.exports = function(robot) {
    robot.hear(/(.*) zoom room (.*)/i, function(res){
        cmd = res.match[1]
        room = res.match[2]
        if (cmd == "start"){
            res.send("starting " + room);
        getRoomId(room).then(function(roomId){
            join(roomId);
        });
        }
        if (cmd == "end"){
            res.send("stopping "+ room);
        getRoomId(room).then(function(roomId){
            end(roomId);
        });
        }
        if (cmd == "reboot"){
            res.send("restarting the machine for room " + room);
            getRoomId(room).then(function(roomId){
                restart(roomId);
            });
        }
    });
}