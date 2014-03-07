var MovingWorldObject = function MovingWorldObject(){
	MovingWorldObject.super_.apply(this, arguments);
};

MovingWorldObject.DIR = {
	UP: 0,
	RIGHT: 1,
	DOWN: 2,
	LEFT: 3
}

require("util").inherits(MovingWorldObject, require("./worldobject"));

MovingWorldObject.prototype.direction = MovingWorldObject.DIR.RIGHT;
MovingWorldObject.prototype.speed = 1;

MovingWorldObject.prototype.update = function(){
	MovingWorldObject.super_.prototype.update.apply(this, arguments);

	if(this.speed == 0){
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

module.exports = MovingWorldObject;