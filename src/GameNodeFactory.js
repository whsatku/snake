(function(){
"use strict";

var GameNodeFactory = function(){
	this.registry = [];
};

GameNodeFactory.prototype.register = function(logicObject, gameObject){
	this.registry.push([logicObject, gameObject]);
};

GameNodeFactory.prototype.create = function(object){
	for(var i = 0; i < this.registry.length; i++){
		if(object instanceof this.registry[i][0]){
			var out = new this.registry[i][1]();
			out.object = object;
			out.init();

			return out;
		}
	}
};

window.GameNodeFactory = new GameNodeFactory();

window.GameNodeFactory.register(GameLogic.Snake, SnakeNode);
window.GameNodeFactory.register(GameLogic.Powerup, PowerupNode);
window.GameNodeFactory.register(GameLogic.Spawn, SpawnNode);
window.GameNodeFactory.register(GameLogic.Obstacle, ObstacleNode);
})();