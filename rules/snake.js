"use strict";

var Snake = function Snake(){
	Snake.super_.apply(this, arguments);

	this.positions = [];
	this.maxLength = Snake.DEFAULT_MAX_LENGTH;
	this.startingPosition = [0, 0];

	this.on("collision", this.onCollide.bind(this));
};

Snake.DEFAULT_MAX_LENGTH = 4;

var MovingWorldObject = require("./movingworldobject");
var Powerup = require("./powerup");

require("util").inherits(Snake, MovingWorldObject);

Snake.prototype.update = function(){
	if(this.positions.length === 0){
		this.positions.unshift([this.x, this.y]);
	}

	Snake.super_.prototype.update.apply(this, arguments);

	this._wrapAround();

	this.positions.unshift([this.x, this.y]);

	this._trimPositionToLength();
};

/**
 * Set starting position and move the snake to starting position
 */
Snake.prototype.setStartingPosition = function(x, y){
	this.startingPosition = [x, y];
	this.x = x;
	this.y = y;
};

Snake.prototype.randomStartingPosition = function(){
	this.setStartingPosition(
		this.world.random.randInt(0, this.world.state.width),
		this.world.random.randInt(0, this.world.state.height)
	);
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
			if(this.isOpposite(map[input])){
				break;
			}
			this.direction = map[input];
			break;
	}
};

Snake.prototype.isCollideWith = function(b){
	if(b instanceof Snake){
		var bodyCollision = false;
		for(var snake1=0; snake1<this.positions.length; snake1++){
			for(var snake2=0; snake2<b.positions.length; snake2++){
				bodyCollision = this.positions[snake1][0] === b.positions[snake2][0] &&
					this.positions[snake1][1] === b.positions[snake2][1];
				if(bodyCollision){
					break;
				}
			}
			if(bodyCollision){
				break;
			}
		}
		return bodyCollision || Snake.super_.prototype.isCollideWith.call(this, b);
	}
	return Snake.super_.prototype.isCollideWith.call(this, b);
};

Snake.prototype.reset = function(){
	this.randomStartingPosition();
	this.maxLength = Snake.DEFAULT_MAX_LENGTH;
	this.positions = [];
	this.emit("reset");
};

Snake.prototype.onCollide = function(target){
	if(target.deadly){
		this.reset();
	}
	if(target instanceof Powerup){
		this.maxLength += target.growth;
	}
};

module.exports = Snake;