/* global cc */
"use strict";

window.Scoreboard = cc.LayerColor.extend({
	background: cc.c4b(0, 0, 0, 150),
	width: 230,
	height: 300,

	rowHeight: 30,
	padTop: 10,
	padLeft: 10,
	padRight: 10,
	cellWidth: 30,

	init: function() {
		this._super(this.background, this.width, this.height);
		this.scheduleUpdate();

		this.players = [];

		var headerS = this.createText("Score", true);
		headerS.setPosition(this.width - this.padRight - this.cellWidth*2, this.height - this.padTop);
		var headerK = this.createText("K", true);
		headerK.setPosition(this.width - this.padRight - this.cellWidth, this.height - this.padTop);
		var headerD = this.createText("D", true);
		headerD.setPosition(this.width - this.padRight, this.height - this.padTop);
		this.addChild(headerS);
		this.addChild(headerK);
		this.addChild(headerD);
	},

	update: function(){
		var game = this.getGameLayer().game;
		var realSnakeCount = 0;
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

	createText: function(text, alignRight){
		var out = cc.LabelTTF.create(text, "Tahoma", 18);
		out.setAnchorPoint(alignRight === true ? 1 : 0, 1);
		return out;
	},

	createChildrenAtPos: function(pos){
		var y = this.height - this.padTop - this.rowHeight * (pos+1);

		var name = this.createText("");
		name.setPosition(this.padLeft, y);
		this.addChild(name);

		var out = [name];

		for(var i = 2; i >= 0; i--){
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
	DEATH: 3
};