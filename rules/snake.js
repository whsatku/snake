"use strict";

var Spawn = require("./spawn");

var Snake = function Snake(){
	Snake.super_.apply(this, arguments);

	this.positions = [];
	this.maxLength = Snake.DEFAULT_MAX_LENGTH;
	this._turning = null;
	this.index = -1;
	this.tickToSpawn = 0;

	this.on("collision", this.onCollide.bind(this));
};

Snake.cls = "Snake";
Snake.DEFAULT_MAX_LENGTH = 4;
Snake.RESPAWN_DELAY = 10; // ticks

var MovingWorldObject = require("./movingworldobject");
var Powerup = require("./powerup");

require("util").inherits(Snake, MovingWorldObject);

Snake.prototype.update = function(){
	if(this.tickToSpawn > 0){
		this.tickToSpawn--;
		if(this.tickToSpawn <= 0){
			this.respawn();
		}
		return;
	}

	if(this.positions.length === 0){
		this.positions.unshift([this.x, this.y]);
	}

	if(this._turning !== null){
		this.direction = this._turning;
		this._turning = null;
	}

	Snake.super_.prototype.update.apply(this, arguments);

	this._wrapAround();

	this.positions.unshift([this.x, this.y, this.direction]);

	this._trimPositionToLength();
};

Snake.prototype._trimPositionToLength = function(){
	if(this.positions.length > this.maxLength){
		this.positions = this.positions.slice(0, this.maxLength);
	}
};

Snake.prototype._wrapAround = function(){
	if(!this.isOffScreen()){
		return;
	}
	if(this.x < 0){
		this.x = this.world.state.width - 1;
	}
	if(this.y < 0){
		this.y = this.world.state.height - 1;
	}
	if(this.x >= this.world.state.width){
		this.x = 0;
	}
	if(this.y >= this.world.state.height){
		this.y = 0;
	}
};

Snake.prototype.input = function(input){
	switch(input){
		case "left": case "right": case "down": case "up":
			var map = {
				"left": MovingWorldObject.DIR.LEFT,
				"right": MovingWorldObject.DIR.RIGHT,
				"down": MovingWorldObject.DIR.DOWN,
				"up": MovingWorldObject.DIR.UP
			};
			if(map[input] === this.direction){
				return false;
			}else if(this.isOpposite(map[input])){
				return false;
			}
			this._turning = map[input];
			return true;
	}
	return false;
};

Snake.prototype.isCollideWith = function(b, crosscheck){
	var target, checkObject;
	if(b instanceof Snake){
		target = b.positions;
		if(this === b){
			target = this.positions.slice(1);
		}
		checkObject = this;
	}else{
		target = this.positions;
		checkObject = b;
	}
	for(var position in target){
		if(target[position][0] === checkObject.x && target[position][1] === checkObject.y){
			return true;
		}
	}
	if(crosscheck === false){
		return false;
	}
	return b.isCollideWith(this, false);
};

Snake.prototype.die = function(){
	this.reset();
	this.hidden = true;
	this.direction = MovingWorldObject.DIR.STOP;

	this.spawn = this._makeSpawn();
	this.world.objects.push(this.spawn);

	this.tickToSpawn = Snake.RESPAWN_DELAY;
};

Snake.prototype._makeSpawn = function(){
	if(this.spawn){
		this.spawn.fromSnake(this);
		return this.spawn;
	}
	
	var spawn = new Spawn(this.world);
	spawn.fromSnake(this);
	return spawn;
};

Snake.prototype.respawn = function(){
	this.world.removeChild(this.spawn);
	this.spawn = null;
	this.tickToSpawn = 0;

	this.hidden = false;
	this.direction = this._turning !== null ? this._turning : MovingWorldObject.DIR.RIGHT;
};

Snake.prototype.reset = function(){
	this.maxLength = Snake.DEFAULT_MAX_LENGTH;
	this.positions = [];
	this.randomPosition();
	this.emit("reset");
};

Snake.prototype.cleanup = function(){
	Snake.super_.prototype.cleanup.apply(this);
	if(this.spawn){
		this.world.removeChild(this.spawn);
	}
};

Snake.prototype.onCollide = function(target){
	if(this.hidden){
		return false;
	}
	if(target instanceof Snake){
		if(this.x == target.x && this.y == target.y){
			// head-on-head collision
			this.die();
			target.die();
			return;
		}else if(!this.isCollideWith(target, false)){
			// head-on-tail collision
			return;
		}
	}
	if(target.deadly){
		this.die();
	}
	if(target instanceof Powerup){
		this.maxLength += target.growth;
	}
};

Snake.prototype.getState = function(){
	var state = Snake.super_.prototype.getState.apply(this);
	state.positions = this.positions.slice(0);
	state.maxLength = this.maxLength;
	state.index = this.index;
	return state;
};

Snake.prototype.loadState = function(state){
	Snake.super_.prototype.loadState.call(this, state);
	this.positions = state.positions;
	this.maxLength = state.maxLength;
	this.index = state.index;
};

module.exports = Snake;