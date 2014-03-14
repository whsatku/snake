/* global cc, GameLogic */
/* jshint unused:false */
"use strict";

window.SnakeBitsNode = WorldObjectNode.extend({
	init: function(){
		this._super("res/snakebody.png");
		this.createColor();
	},

	createColor: function(){
		this.colorSprite = cc.Sprite.create("res/snakebody_c.png");
		this.colorSprite.setAnchorPoint(0, 0);
		this.addChild(this.colorSprite);
	},

	// sync is managed by SnakeNode
	syncFromEngine: function(){}
});