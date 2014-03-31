(function(){

var Netcode = function(game){
	if(!(this instanceof Netcode)){
		return new Netcode(game);
	}
	this.game = game;
};

Netcode.Const = {
	LobbyState: {
		"LOBBY": 0,
		"IN_GAME": 1,
		"FINISHED": 2
	}
};

Netcode.prototype.getServer = function(){
	if(window.location.protocol == "file:"){
		return "http://localhost:45634/primus";
	}else{
		return window.location.protocol + "//" + window.location.hostname + ":45634/primus";
	}
};

Netcode.prototype.connect = function(){
	this.primus = Primus.connect(this.getServer());
	this.primus.on("open", this.onOpen.bind(this));
	this.primus.on("data", this.onData.bind(this));
};

Netcode.prototype.onOpen = function(){
	console.log("netcode: connected");
	this.send({command: "lobbyjoin", lobby: 0});
};

Netcode.prototype.onData = function(data){
	var self = this;

	if(data.state === Netcode.Const.LobbyState.IN_GAME){
		if(typeof data.game == "object"){
			this.game.loadState(data.game);
			this.send({command: "ready"});
		}else if(data.hash !== undefined){
			data.cmd.forEach(function(cmd){
				self.game[cmd[0]].apply(self.game, cmd.slice(1));
			});
			this.game.step();
			this.game.prepareState();
			var hash = this.game.hashState();
			if(hash != data.hash){
				console.error("desync", "local", hash, "server", data.hash);
				this.send({command: "desync"});
			}else{
				this.send({command: "ready"});
			}
		}
	}
};

Netcode.prototype.send = function(data){
	return this.primus.write(data);
};

Netcode.prototype.input = function(key){
	return this.send({command: "input", key: key});
};

window.Netcode = Netcode;

})();