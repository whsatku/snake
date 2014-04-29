var io = require('socket.io').listen(8080, {
    log: 0,
});

var colors = require('colors');

var client= [];
var string ={
    info:'   info    - '.bold.green,
    message:'   message - '.bold.blue,
    update:'   update  - '.bold.cyan,
}
var datetime = new Date().toISOString();

console.log('Date '.underline.bold.red+datetime.bold.yellow);
console.log('####################### NUNIN SERVER ########################'.bold.yellow);

var minutes = 0.5, the_interval = minutes * 60 * 1000;
setInterval(function() {
    console.log(string.update+"Server 1 : "+client.length+" Player(s) ");
    for(var i=0;i<client.length;i++){
        console.log(string.info+"Player<".bold+(i+1).toString().bold+"> ".bold+client[i].characterID+" Blood:"+client[i].health);    
    }
}, the_interval);

io.sockets.on('connection', function(socket) {
    socket.on('regis', function( api, X, Y, health, Status, flip) {
        var character = {
            sessionid: this.id,
        	characterID: api,
        	x: X,
        	y: Y,
            health: health,
            delayStatus: 0,
        	status: Status,
            combo: 0,
            flip: flip,
        }
        var unique = true;
        for(var i=0 ; i<client.length;i++){
            if(client[i].characterID == api)
                unique = false;
        }
        if(unique){
            console.log(string.message+'New Character Connect!!!'.bold);
            console.log(string.info+'ID : '.bold+api);
            client.push(character);
            socket.broadcast.emit('newChar',character);
            socket.emit('regis' , character.characterID , client);
        }
    });
    socket.on('attack', function( aAttack, bAttack ){ // a attack to b

        for( var i=0; i< client.length ;i++ ){
            if( client[i].characterID == bAttack.charID ){
                if(client[i].health > 0){
                    var damage = Math.floor(50*Math.random()+(aAttack.combo*10));
                    if( client[i].status != 3 ){
                        client[i].health -= damage;
                        client[i].status = 2;
                        if( aAttack.X >= client[i].x ){
                            client[i].x -= 1;
                        }else{
                            client[i].x += 1;
                        }
                    }else if( bAttack.canBlock ){
                        client[i].status = 3;
                        if( client[i].flip ){
                            client[i].x += 1;
                        }else{
                            client[i].x -= 1;
                        }
                    }else{
                        client[i].health -= damage;
                        client[i].status = 2;
                        if( aAttack.X >= client[i].x ){
                            client[i].x -= 1;
                        }else{
                            client[i].x += 1;
                        }
                    }
                }
                if(client[i].health < 0 )
                    client[i].health = 0;
                break;
            }
        }
        io.sockets.emit('updateEnermy', client);
    });
    socket.on('status', function( ID, printMyStatus ) {
    	for(var i=0;i<client.length;i++){
    		if(( client[i].characterID == ID ) && (client[i].x != printMyStatus[0] || client[i].y != printMyStatus[1] || client[i].status != printMyStatus[2] || client[i].health != printMyStatus[3] || client[i].delayStatus != printMyStatus[4] || client[i].combo != printMyStatus[5] )){
    			client[i].x = printMyStatus[0];
    			client[i].y = printMyStatus[1];
    			client[i].status = printMyStatus[2];
                client[i].health = printMyStatus[3];
                client[i].delayStatus = printMyStatus[4];
                client[i].combo = printMyStatus[5];
                client[i].flip = printMyStatus[6];
                io.sockets.emit('updateEnermy', client);
                break;
    		}
    	}
    });
    socket.on('disconnect', function() {
        var IDdisconnect = null;
        for( var i=0;i<client.length;i++){
        	if(client[i].sessionid == this.id){
                console.log(string.info+"Disconnect ID : ".bold.red+client[i].characterID);
                IDdisconnect = client[i].characterID;
    			client.splice(i, 1);
    			break;
    		}
        }
        socket.broadcast.emit('disconnect',IDdisconnect);
    });
}); 
