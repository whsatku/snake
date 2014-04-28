/* global cc, GameLogic */
/* jshint unused:false */
"use strict";

window.GameLayer = cc.LayerColor.extend({
	gridSize: [16, 16],
	map: "empty",
	scoreboardHideDuration: 0.05,

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

		this.settings = this.getParent().settings;

		this.log(this.settings.name);

		// ease debugging
		window.gamelayer = this;

		this.initGame();
		this.initPerkBar();
		this.initScoreboard();

		if(this.settings.local){
			this.initLocalGame();
		}else{
			this.initNetworkGame();
		}
	},

	initGame: function(){
		this.game = new GameLogic.Game();
		this.game.on("step", this.onGameStepped.bind(this));
		this.game.on("loadState", this.onLoadState.bind(this));
		this.game.on("snake.dead", this.onSnakeDie.bind(this));
		this.game.on("perkCollect", this.onPerkCollect.bind(this));
		this.game.on("countdown", this.onCountdown.bind(this));
		this.game.on("gameOver", this.onGameOver.bind(this));
	},

	initLocalGame: function(){
		this.mode = GameLayer.MODES.LOCAL;
		this.game.setSettings(this.settings);
		this.game.player = 0;
		this.initMap();

		this.createPlayer();

		this.schedule(this.gameStep.bind(this), this.game.state.updateRate / 1000, Infinity, 0);

		this.game.on("snake.gameOver", this.onSnakeGameOver.bind(this));

		this.syncFromEngine();
	},

	initNetworkGame: function(){
		var self = this;
		this.mode = GameLayer.MODES.NETWORK;

		this.log = this.log.bind(this);
		this.onLobbyStateChange = this.onLobbyStateChange.bind(this);
		this.onNetData = this.onNetData.bind(this);

		this.netcode = this.getParent().netcode;
		this.netcode.game = this.game;
		this.netcode.on("log", this.log);
		this.netcode.on("state", this.onLobbyStateChange);
		this.netcode.on("data", this.onNetData);

		if(this.netcode.lastGameState){
			this.game.loadState(this.netcode.lastGameState);
			this.netcode.send({command: "ready"});
		}
		if(this.netcode.lastLobbyState){
			this.onLobbyStateChange(this.netcode.lastLobbyState);
		}

		if(WebRTC.isSupported()){
			this.webrtc = new WebRTC();
			// this.webrtc.log = this.netcode.log;
			this.webrtc.bind(this.netcode);
		}
	},

	initPerkBar: function(){
		this.perkBar = new PerkBar(this.game);
		this.getParent().addChild(this.perkBar, 100);
		this.perkBar.init();
		this.perkBar.setAnchorPoint(0, 1);

		var parentBB = this.getParent().getBoundingBox();
		this.perkBar.setPosition(10, parentBB.height - 10);
	},

	initScoreboard: function(){
		this.scoreboard = new Scoreboard();
		this.getParent().addChild(this.scoreboard, 180);
		this.scoreboard.init();

		var parentBB = this.getParent().getBoundingBox();
		this.scoreboard.setPosition(-this.scoreboard.width, parentBB.height - 10 - this.scoreboard.height);
	},

	initMap: function(){
		var w = this.game.width * this.gridSize[0];
		var h = this.game.height * this.gridSize[1];
		this.setContentSize(w, h);
		this.fillFloor();
	},

	initWaitLoadLayer: function(){
		this.waitLoadLayer = new WaitLoad();
		this.getParent().addChild(this.waitLoadLayer, 150);
		this.waitLoadLayer.init();
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

	onSnakeDie: function(snake, killer){
		if(killer !== undefined){
			var killer = this.game.getSnake(killer);
			if(killer === snake){
				this.log(snake.name+" suicided!");
			}else{
				this.log(snake.name+" was killed by "+killer.name);
			}
		}else{
			this.log(snake.name+" died!");
		}
	},

	onSnakeGameOver: function(snake){
		if(snake.index === 0){
			this.showEndscreen();
		}
	},

	onPerkCollect: function(perk, snake){
		this.log(this.perkName[perk] + " was collected by "+snake.name);
	},

	onCountdown: function(value){
		this.log(value);
	},

	onGameOver: function(){
		this.showEndscreen();
	},

	showEndscreen: function(data){
		if(data === undefined){
			data = this.game.getEndscreenData();
		}
		cc.Application.getInstance().endGame(data);
	},

	onLobbyStateChange: function(state){ 	
		if(state === Netcode.Const.LobbyState.WAIT_FOR_LOAD){
			this.initWaitLoadLayer();
		}else if(this.waitLoadLayer){
			this.waitLoadLayer.removeFromParent();
			this.waitLoadLayer = null;
		}
	},

	onNetData: function(data){
		if(data.snakeIndex !== undefined){
			this.game.player = data.snakeIndex;
		}
		if(typeof data.game == "object"){
			// full state object
			this.game.loadState(data.game);
			this.netcode.send({command: "ready"});
		}else if(typeof data.endscreen == "object"){
			this.showEndscreen(data.endscreen);
		}else if(data.hash !== undefined && data.state === Netcode.Const.LobbyState.IN_GAME){
			// game step
			data.cmd.forEach(function(cmd){
				this.game[cmd[0]].apply(this.game, cmd.slice(1));
			}, this);
			if(!this.game.$firstHash){
				// after waiting for players to load
				// the server will send first hash which is state after adding all snakes
				// but no step is performed yet
				this.game.$firstHash = true;
			}else{
				this.game.step();
			}
			this.game.prepareState();
			var hash = this.game.hashState();
			if(hash != data.hash){
				console.error("desync", "local", hash, "server", data.hash);
				this.netcode.send({command: "desync"});
			}else{
				this.netcode.send({command: "ready"});
			}
		}
		if(data.state === Netcode.Const.LobbyState.WAIT_FOR_LOAD && this.waitLoadLayer){
			this.waitLoadLayer.updateLoadingStatus(data.players);
		}
	},

	fillFloor: function(){
		var mapName = this.game.state.map;
		var mapData = GameLogic.map[mapName];
		var tileset = this.tileset[mapData.tileset || "brick"];

		this.tileNode = cc.SpriteBatchNode.create("res/tiles.png", this.game.width * this.game.height);
		this.addChild(this.tileNode);

		if(tileset instanceof cc.Color3B){
			this.setColor(tileset);
			return;
		}

		if(tileset.length > 2){
			this.setColor(tileset[2]);
		}

		for(var y=0; y<this.game.height; y++){
			for(var x=0; x<this.game.width; x++){
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

	createPlayer: function(){
		var players = this.settings.players;
		for(var i = 0; i < players.length; i++){
			var player = players[i];
			if(player){
				var snake = this.game.addSnake(player);
			}
		}
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

		if(obj instanceof GameLogic.Obstacle){
			addTo = this.tileNode;
		}

		var node = GameNodeFactory.create(obj);
		addTo.addChild(node);
		this.objectsMap[obj.$id] = node;

		return node;
	},

	_lastId: 1000,
	_generateId: function(){
		return this._lastId++;
	},

	toUIPosition: function(x, y){
		y = this.game.height - y - 1;
		return cc.p(
			x * this.gridSize[0] + this.gridSize[0]/2,
			y * this.gridSize[1] + this.gridSize[1]/2
		);
	},

	log: function(txt){
		this.getParent().log(txt);
	},

	getPlayerColor: function(index){
		var map = [
			cc.c3b(0,0,0),
			cc.c3b(66, 157, 11),
			cc.c3b(157, 131, 11),
			cc.c3b(157, 59, 11),
			cc.c3b(157, 11, 100),
			cc.c3b(11, 114, 157),
			cc.c3b(11, 157, 111),
		];
		return map[index];
	},

	showScoreboard: function(show){
		var x = show ? 10 : -this.scoreboard.width;
		var parentBB = this.getParent().getBoundingBox();
		var action = cc.MoveTo.create(this.scoreboardHideDuration, cc.p(x, parentBB.height - 10 - this.scoreboard.height));

		this.scoreboard.stopAllActions();
		this.scoreboard.runAction(action);
	},

	cleanup: function(){
		this._super();
		this.game.removeAllListeners();
		this.game = null;

		if(this.netcode){
			this.netcode.game = null;
			this.netcode.off("log", this.log);
			this.netcode.off("state", this.onLobbyStateChange);
			this.netcode.off("data", this.onNetData);
		}
	}
});

window.GameLayer.MODES = {
	"LOCAL": 0,
	"NETWORK": 1
};
