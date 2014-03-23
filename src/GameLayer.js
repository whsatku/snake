/* global cc, GameLogic */
/* jshint unused:false */
"use strict";

window.GameLayer = cc.Layer.extend({
	gridSize: [16, 16],
	map: "plain",

	objectsMap: {
	},

	init: function() {
		this.initGame();
	},

	initGame: function(){
		this.game = new GameLogic.Game();
		this.schedule(this.gameStep.bind(this), this.game.state.updateRate / 1000, Infinity, 0);
		this.game.on("step", this.onGameStepped.bind(this));

		this.initMap();

		this.game.addSnake();

		// draw initial
		this.onGameStepped();
	},

	initMap: function(){
		this.game.loadMap(this.map);
		this.setContentSize(this.game.state.width * this.gridSize[0], this.game.state.height * this.gridSize[1]);
		this.fillFloor();
	},

	gameStep: function(){
		this.game.step();
	},

	onGameStepped: function(){
		this.syncFromEngine();
	},

	fillFloor: function(){

	},

	syncFromEngine: function(){
		console.log("sync");
		var self = this;

		var foundObjects = [];
		// check for updated objects
		this.game.objects.forEach(function(obj){
			var node;

			if(typeof obj.$id == "undefined"){
				node = self._createChildObject(obj);
			}

			foundObjects.push(obj.$id);

			node = self.objectsMap[obj.$id];
			node.syncFromEngine(obj);
		});

		// delete removed objects
		Object.keys(this.objectsMap).forEach(function(objId){
			if(foundObjects.indexOf(parseInt(objId)) == -1){
				self.removeChild(self.objectsMap[objId]);
				self.objectsMap[objId] = undefined;
			}
		});
	},

	_createChildObject: function(obj){
		obj.$id = this._generateId();
		var ObjectClass = WorldObjectNode;
		if(obj instanceof GameLogic.Snake){
			ObjectClass = SnakeNode;
		}else if(obj instanceof GameLogic.Powerup){
			ObjectClass = PowerupNode;
		}
		var node = new ObjectClass();
		this.addChild(node);
		node.init();
		this.objectsMap[obj.$id] = node;

		return node;
	},

	_lastId: 1000,
	_generateId: function(){
		return this._lastId++;
	},

	toUIPosition: function(x, y){
		y = this.game.state.height - y - 1;
		return cc.p(
			x * this.gridSize[0] + this.gridSize[0]/2,
			y * this.gridSize[1] + this.gridSize[1]/2
		);
	}
});