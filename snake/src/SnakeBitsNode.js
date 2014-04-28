/* global cc, GameLogic */
/* jshint unused:false */
"use strict";

window.SnakeBitsNode = WorldObjectNode.extend({
	init: function(){
		this._super("res/snake-"+this.color+".png", cc.rect(16, 0, 16, 16));
	},

	// sync is managed by SnakeNode
	syncFromEngine: function(){}
});