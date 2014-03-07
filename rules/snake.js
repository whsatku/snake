"use strict";

var Snake = function Snake(){
	Snake.super_.apply(this, arguments);

	this.positions = [];
	this.maxLength = 4;
};

require("util").inherits(Snake, require("./movingworldobject"));

Snake.prototype.update = function(){
	if(this.positions.length === 0){
		this.positions.unshift([this.x, this.y]);
	}

	Snake.super_.prototype.update.apply(this, arguments);

	this._wrapAround();

	this.positions.unshift([this.x, this.y]);

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

module.exports = Snake;