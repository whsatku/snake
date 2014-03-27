/* global cc, GameLogic */
/* jshint unused:false */
"use strict";

window.GameScene = cc.Scene.extend({
	onEnter: function() {
		this._super();

		this.createBackground();

		this.gameLayer = new GameLayer();
		this.addChild(this.gameLayer);
		this.gameLayer.setAnchorPoint(0.5, 0.5);
		var size = this.getStageSize();
		this.gameLayer.setPosition(size.width/2, size.height/2);
		this.gameLayer.init();

		this.initKeyboard();
	},

	createBackground: function(){
		var bg = cc.Sprite.create("res/forest.jpg");
		bg.setAnchorPoint(0, 0);
		this.addChild(bg);
	},

	initKeyboard: function(){
		var kbd = new KeyboardControlLayer(this.gameLayer);
		this.addChild(kbd, 1000000);
		kbd.init();
	},

	getStageSize: function(){
		return cc.Director.getInstance().getWinSizeInPixels();
	},
});