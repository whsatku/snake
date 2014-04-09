/* global cc, GameLogic */
/* jshint unused:false */
"use strict";

window.GameLayer = cc.LayerColor.extend({
	gridSize: [16, 16],
	map: "empty",

	objectsMap: {
	},

	tileset: {
		"grass": cc.c3b(109, 170, 44),
		"brick": ["res/tiles.png", cc.rect(0, 32, 16, 16), cc.c3b(210, 125, 44)],
		"lava": ["res/tiles.png", cc.rect(96, 16, 16, 16), cc.c3b(133, 76, 48)],
		"palace": cc.c3b(66, 81, 93),
	},

	perkName: {
		"bite": "Bite",
		"respawn": "Respawning",
		"inverse_collect": "Inverse",
		"reverse_collect": "Reverse"
	},

	init: function() {
		this._super(cc.c4b(0, 0, 0, 255), 0, 0);

		// ease debugging
		window.gamelayer = this;
		this.initGame();
		// this.initLocalGame();
		this.initNetworkGame();
		this.initPerkBar();
	},

	initGame: function(){
		this.game = new GameLogic.Game();
		this.game.on("step", this.onGameStepped.bind(this));
		this.game.on("loadState", this.onLoadState.bind(this));
		this.game.on("snakeDie", this.onSnakeDie.bind(this));
		this.game.on("perkCollect", this.onPerkCollect.bind(this));
	},

	initLocalGame: function(){
		this.mode = GameLayer.MODES.LOCAL;
		this.schedule(this.gameStep.bind(this), this.game.state.updateRate / 1000, Infinity, 0);
		this.game.loadMap(this.map);
		this.game.player = 0;
		this.initMap();

		this.game.addSnake();
		this.game.addSnake();

		this.syncFromEngine();
	},

	initNetworkGame: function(){
		var self = this;
		this.mode = GameLayer.MODES.NETWORK;
		this.log("Connecting to server...");

		this.netcode = new Netcode(this.game);
		this.netcode.log = this.log.bind(this);
		this.netcode.connect();

		if(WebRTC.isSupported()){
			this.webrtc = new WebRTC();
			this.webrtc.log = this.netcode.log;
			this.webrtc.bind(this.netcode);
		}
	},

	initPerkBar: function(){
		this.perkBar = new PerkBar(this.game);
		this.getParent().addChild(this.perkBar);
		this.perkBar.init();
		this.perkBar.setAnchorPoint(0, 1);

		var parentBB = this.getParent().getBoundingBox();
		this.perkBar.setPosition(10, parentBB.height - 10);
	},

	initMap: function(){
		var w = this.game.state.width * this.gridSize[0];
		var h = this.game.state.height * this.gridSize[1];
		this.setContentSize(w, h);
		this.fillFloor();
	},

	gameStep: function(){
		this.game.step();
	},

	onLoadState: function(){
		this.removeAllChildren();
		this.initMap();
		this.syncFromEngine();
	},

	onGameStepped: function(){
		this.syncFromEngine();
	},

	onSnakeDie: function(snake){
		this.log("Player "+(snake.index+1)+" died!");
	},

	onPerkCollect: function(perk, snake){
		this.log(this.perkName[perk] + " was collected by "+(snake.index+1));
	},

	fillFloor: function(){
		var mapName = this.game.state.map;
		var mapData = GameLogic.map[mapName];
		var tileset = this.tileset[mapData.tileset || "brick"];

		this.tileNode = cc.SpriteBatchNode.create("res/tiles.png", this.game.state.width * this.game.state.height);
		this.addChild(this.tileNode);

		if(tileset instanceof cc.Color3B){
			this.setColor(tileset);
			return;
		}

		if(tileset.length > 2){
			this.setColor(tileset[2]);
		}

		for(var y=0; y<this.game.state.height; y++){
			for(var x=0; x<this.game.state.width; x++){
				var node = cc.Sprite.create.apply(null, tileset);
				node.setPosition(this.toUIPosition(x, y));
				this.tileNode.addChild(node);
			}
		}
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
				if(self.objectsMap[objId] === undefined){
					return;
				}
				// SnakeNode is not a direct descendent of this node
				// so removeChild doesn't work.
				self.objectsMap[objId].removeFromParent();
				self.objectsMap[objId] = undefined;
			}
		});

		this.perkBar.syncFromEngine(this.game.getSnake(this.game.player));
	},

	input: function(key){
		switch(this.mode){
			case GameLayer.MODES.LOCAL:
				this.game.input(0, key);
				break;
			case GameLayer.MODES.NETWORK:
				this.netcode.input(key);
				break;
		}
	},

	_createChildObject: function(obj){
		obj.$id = this._generateId();

		var ObjectClass = WorldObjectNode;
		var addTo = this;
		if(obj instanceof GameLogic.Snake){
			ObjectClass = SnakeNode;
		}else if(obj instanceof GameLogic.Powerup){
			ObjectClass = PowerupNode;
		}else if(obj instanceof GameLogic.Spawn){
			ObjectClass = SpawnNode;
		}else if(obj instanceof GameLogic.Obstacle){
			ObjectClass = ObstacleNode;
			addTo = this.tileNode;
		}

		var node = new ObjectClass();
		node.object = obj;
		node.init();
		addTo.addChild(node);
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
	},

	log: function(txt){
		this.getParent().log(txt);
	}
});

window.GameLayer.MODES = {
	"LOCAL": 0,
	"NETWORK": 1
};
