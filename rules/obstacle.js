var Obstacle = function Obstacle(){
	Obstacle.super_.apply(this, arguments);
};

require("util").inherits(Obstacle, require("./worldobject"));

module.exports = Obstacle;