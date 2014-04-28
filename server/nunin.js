(function(){

"use strict";

var EventEmitter = require("events").EventEmitter;

function NuninPlayer(index){
	// x, y, status, health, delay, combo, flip
	this.data = [-1, -1, 1, 1000, 0, 0, false];
	this.index = index;
}

NuninPlayer.INDEX = {
	"x": 0,
	"y": 1,
	"status": 2,
	"health": 3,
	"delay": 4,
	"combo": 5,
	"flip": 6
};

function Nunin(){
	this.state = {
		updateRate: 1000/30
	};
	this.players = [];
}

require("util").inherits(Nunin, EventEmitter);

Nunin.prototype.setSettings = function(settings){
	this.settings = settings;
};

Nunin.prototype.prepareState = function(){
	this.state.players  = [];
	for(var i = 0; i < this.players.length; i++){
		var player = this.players[i];
		this.state.players.push(player.data);
	}
};

Nunin.prototype.hashState = function(){
	return this.state;
};

Nunin.prototype.step = function(){
};

Nunin.prototype.input = function(id, input){
	if(input[0] == "attack"){
		var aAttack = input[1];
		var bAttack = input[2];
		var target = this.players[bAttack.charID].data;
		if(target[NuninPlayer.INDEX.health] > 0){
			var damage = Math.floor(50*Math.random()+(aAttack.combo*10));
			if( target[NuninPlayer.INDEX.status] != 3 ){
				target[NuninPlayer.INDEX.health] -= damage;
				target[NuninPlayer.INDEX.status] = 2;
				if( aAttack.X >= target[NuninPlayer.INDEX.x] ){
					target[NuninPlayer.INDEX.x] -= 1;
				}else{
					target[NuninPlayer.INDEX.x] += 1;
				}
			}else if( bAttack.canBlock ){
				target[NuninPlayer.INDEX.status] = 3;
				if( target[NuninPlayer.INDEX.flip] ){
					target[NuninPlayer.INDEX.x] += 1;
				}else{
					target[NuninPlayer.INDEX.x] -= 1;
				}
			}else{
				target[NuninPlayer.INDEX.health] -= damage;
				target[NuninPlayer.INDEX.status] = 2;
				if( aAttack.X >= target[NuninPlayer.INDEX.x] ){
					target[NuninPlayer.INDEX.x] -= 1;
				}else{
					target[NuninPlayer.INDEX.x] += 1;
				}
			}
		}
		if(target[NuninPlayer.INDEX.health] < 0 )
			target[NuninPlayer.INDEX.health] = 0;
	}else{
		this.players[id].data = input;
	}
	return false;
};

Nunin.prototype.addSnake = function(data){
	var player = new NuninPlayer(this.players.length);
	this.players.push(player);
	return player;
};

Nunin.prototype.removeSnake = function(){

};

module.exports = Nunin;

})();