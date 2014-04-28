"use strict";

var MovingWorldObject = function MovingWorldObject(){
	MovingWorldObject.super_.apply(this, arguments);
};

MovingWorldObject.DIR = {
	UP: 0,
	RIGHT: 1,
	DOWN: 2,
	LEFT: 3,
	STOP: -1
};

MovingWorldObject.DIR_S = {};

Object.keys(MovingWorldObject.DIR).forEach(function(dir){
	var val = MovingWorldObject.DIR[dir];
	MovingWorldObject.DIR_S[val] = dir.charAt(0);
});

require("util").inherits(MovingWorldObject, require("./worldobject"));

MovingWorldObject.cls = "MovingWorldObject";
MovingWorldObject.prototype.direction = MovingWorldObject.DIR.RIGHT;
MovingWorldObject.prototype.speed = 1;

MovingWorldObject.prototype.update = function(){
	MovingWorldObject.super_.prototype.update.apply(this, arguments);

	if(this.speed === 0){
		return;
	}

	if(this.direction == MovingWorldObject.DIR.UP){
		this.y -= this.speed;
	}else if(this.direction == MovingWorldObject.DIR.DOWN){
		this.y += this.speed;
	}else if(this.direction == MovingWorldObject.DIR.LEFT){
		this.x -= this.speed;
	}else if(this.direction == MovingWorldObject.DIR.RIGHT){
		this.x += this.speed;
	}
};

MovingWorldObject.prototype.isOpposite = function(dir1, dir2){
	if(dir2 === undefined){
		dir2 = dir1;
		dir1 = this.direction;
	}
	return MovingWorldObject.isOpposite(dir1, dir2);
};

MovingWorldObject.isOpposite = function(dir1, dir2){
	return (dir1 === MovingWorldObject.DIR.LEFT && dir2 === MovingWorldObject.DIR.RIGHT) ||
		(dir1 === MovingWorldObject.DIR.UP && dir2 === MovingWorldObject.DIR.DOWN) ||
		(dir1 === MovingWorldObject.DIR.RIGHT && dir2 === MovingWorldObject.DIR.LEFT) ||
		(dir1 === MovingWorldObject.DIR.DOWN && dir2 === MovingWorldObject.DIR.UP);
};

MovingWorldObject.getOpposite = function(dir){
	var map = {};
	map[MovingWorldObject.DIR.LEFT] = MovingWorldObject.DIR.RIGHT;
	map[MovingWorldObject.DIR.RIGHT] = MovingWorldObject.DIR.LEFT;
	map[MovingWorldObject.DIR.UP] = MovingWorldObject.DIR.DOWN;
	map[MovingWorldObject.DIR.DOWN] = MovingWorldObject.DIR.UP;

	return map[dir] !== undefined ? map[dir] : MovingWorldObject.DIR.STOP;
};

MovingWorldObject.prototype.getState = function(){
	var state = MovingWorldObject.super_.prototype.getState.apply(this);
	state.direction = this.direction;
	state.speed = this.speed;
	return state;
};

MovingWorldObject.prototype.loadState = function(state){
	MovingWorldObject.super_.prototype.loadState.call(this, state);
	this.direction = state.direction;
	this.speed = state.speed;
};

module.exports = MovingWorldObject;