/* global cc */
"use strict";

window.WaitLoad = cc.LayerColor.extend({
	foregroundColor: cc.c3b(255, 255, 255),
	backgroundColor: cc.c4b(0, 0, 0, 180),

	boxColor: cc.c4b(0, 100, 0, 80),
	boxWidth: 400,
	boxHeight: 200,

	playerHeight: 30,
	playerPadTop: 10,
	playerPadLeft: 10,
	playerPadRight: 10,

	readyString: "Ready",
	notReadyString: "Loading",
	readyColor: cc.c3b(0, 255, 0),
	notReadyColor: cc.c3b(255, 0, 0),

	text: "Waiting for players to load...",

	init: function() {
		this._super(this.backgroundColor);

		var bb = this.getBoundingBox();

		this.textNode = cc.LabelTTF.create(this.text, "Tahoma", 24);
		this.textNode.setFontFillColor(this.foregroundColor);
		this.textNode.setAnchorPoint(0.5, 0);
		this.textNode.setPosition(bb.width/2, (bb.height/2) + 100);
		this.addChild(this.textNode);

		this.playerList = cc.LayerColor.create(this.boxColor, this.boxWidth, this.boxHeight);
		// layercolor cannot be setAnchored
		this.playerList.setPosition((bb.width / 2) - (this.boxWidth / 2), (bb.height/2) + 80 - this.boxHeight);
		this.addChild(this.playerList);
	},

	updateLoadingStatus: function(data){
		this.playerList.removeAllChildren();

		for(var i = 0; i < data.length; i++){
			var player = data[i];

			var playerName = cc.LabelTTF.create(player.name, "Tahoma", 20);
			playerName.setAnchorPoint(0, 1);
			playerName.setFontFillColor(this.getGameLayer().getPlayerColor(player.color));
			playerName.setPosition(this.playerPadLeft, this.boxHeight - this.playerPadTop - (i*this.playerHeight));
			this.playerList.addChild(playerName);

			var loading = cc.LabelTTF.create(player.ready ? this.readyString : this.notReadyString, "Tahoma", 20);
			loading.setAnchorPoint(1, 1);
			loading.setFontFillColor(player.ready ? this.readyColor : this.notReadyColor);
			loading.setPosition(this.boxWidth - this.playerPadRight, this.boxHeight - this.playerPadTop - (i*this.playerHeight));
			this.playerList.addChild(loading);
		}
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
	}
});