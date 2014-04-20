/* global cc, GameLogic */
/* jshint unused:false */
"use strict";

window.GameScene = cc.Scene.extend({
	ctor: function(settings, netcode){
		this._super();
		this.settings = settings;
		this.netcode = netcode;
		this.logs = [];
	},

	onEnter: function() {
		this._super();

		this.createBackground();
		this.initLog();
		this.initGame();
		this.initKeyboard();
	},

	initGame: function(){
		this.gameLayer = new GameLayer();
		this.addChild(this.gameLayer);

		this.gameLayer.setAnchorPoint(0, 0);
		var size = this.getStageSize();
		this.gameLayer.setPosition(10, 10);
		this.gameLayer.init();
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

	initLog: function(){
		this.logNode = cc.LabelTTF.create("", "Tahoma", 14, undefined, cc.TEXT_ALIGNMENT_RIGHT);
		this.logNode.setFontFillColor(cc.c3b(255,255,255));
		this.logNode.enableStroke(cc.c3b(0,0,0), 2);
		this.logNode.setAnchorPoint(1, 1);

		var size = this.getBoundingBox();
		this.logNode.setPosition(size.width - 20, size.height - 20);

		this.addChild(this.logNode, 1000);
		this.schedule(this.updateLog.bind(this), 5, Infinity, 0);
	},

	updateLog: function(dontSlice){
		if(dontSlice !== true){
			this.logs.shift();
		}
		this.logNode.setString(this.logs.join("\n"));
	},

	log: function(msg){
		this.logs.push(msg);
		this.logs = this.logs.slice(-4);
		this.updateLog(true);
	}
});