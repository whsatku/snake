/* global cc, GameLogic */
/* jshint unused:false */
"use strict";

window.GameScene = cc.Scene.extend({
	player: 0,

	onEnter: function() {
		this._super();

		this.gameLayer = new GameLayer();
		this.addChild(this.gameLayer);
		this.gameLayer.setAnchorPoint(0.5, 0.5);
		var size = this.getStageSize();
		this.gameLayer.setPosition(size.width/2, size.height/2);
		this.gameLayer.init();

		this.initKeyboard();
	},

	initKeyboard: function(){
		var kbd = new KeyboardControlLayer(this.gameLayer, this.player);
		this.addChild(kbd, 1000000);
		kbd.init();
	},

	getStageSize: function(){
		return cc.Director.getInstance().getWinSizeInPixels();
	},
});