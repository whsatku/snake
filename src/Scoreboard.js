/* global cc */
"use strict";

window.Scoreboard = cc.LayerColor.extend({
	background: cc.c4b(0, 0, 0, 150),
	width: 300,
	height: 300,

	rowHeight: 30,
	padTop: 10,
	padLeft: 10,
	padRight: 10,
	cellWidth: 40,

	init: function() {
		this._super(this.background, this.width, this.height);
		this.scheduleUpdate();

		this.players = [];

		["Lag", "D", "K", "Score"].forEach(function(text, index){
			var header = this.createText(text, true, 16);
			header.setPosition(this.width - this.padRight - this.cellWidth*index, this.height - this.padTop);
			this.addChild(header);
		}, this);
	},

	update: function(){
		var game = this.getGameLayer().game;
		var realSnakeCount = 0;
		var netcode = this.getGameLayer().netcode;
		for(var i = 0; i < game._snakes.length; i++){
			var snake = game._snakes[i];
			if(!(snake instanceof GameLogic.Snake)){
				continue;
			}
			if(!this.players[realSnakeCount]){
				this.players[realSnakeCount] = this.createChildrenAtPos(realSnakeCount);
			}
			this.players[realSnakeCount][Scoreboard.POS.NAME].setString(snake.name);
			this.players[realSnakeCount][Scoreboard.POS.NAME].setFontFillColor(this.getGameLayer().getPlayerColor(snake.color));
			this.players[realSnakeCount][Scoreboard.POS.SCORE].setString(snake.score);
			this.players[realSnakeCount][Scoreboard.POS.KILL].setString(snake.kill);
			this.players[realSnakeCount][Scoreboard.POS.DEATH].setString(snake.death);
			this.players[realSnakeCount][Scoreboard.POS.PING].setString(netcode ? netcode.ping[snake.index] : 0);
			realSnakeCount++;
		}
		for(var i = realSnakeCount; i < this.players.length; i++){
			for(var index = 0; index < this.players[i].length; index++){
				this.removeChild(this.players[i][index]);
			}
		}
		this.players = this.players.slice(0, realSnakeCount);
	},

	getGameLayer: function(){
		if(this.gameLayer){
			return this.gameLayer;
		}
		var siblings = this.getParent().getChildren();
		for(var i = 0; i < siblings.length; i++){
			if(siblings[i] instanceof GameLayer){
				this.gameLayer = siblings[i];
				return this.gameLayer;
			}
		}
	},

	createText: function(text, alignRight, size){
		var out = cc.LabelTTF.create(text, "Tahoma", size || 18);
		out.setAnchorPoint(alignRight === true ? 1 : 0, 1);
		return out;
	},

	createChildrenAtPos: function(pos){
		var y = this.height - this.padTop - this.rowHeight * (pos+1);

		var name = this.createText("");
		name.setPosition(this.padLeft, y);
		this.addChild(name);

		var out = [name];

		for(var i = 3; i >= 0; i--){
			var row = this.createText("", true);
			row.setPosition(this.width - this.padRight - this.cellWidth*i, y);
			this.addChild(row);
			out.push(row);
		}

		return out;
	},
});

Scoreboard.POS = {
	NAME: 0,
	SCORE: 1,
	KILL: 2,
	DEATH: 3,
	PING: 4
};