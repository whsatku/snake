/* global cc */
/* jshint unused:false */
"use strict";

window.KeyboardControlLayer = cc.Layer.extend({
	ctor: function(root, player){
		this._super();
		this._root = root;
		this.player = player;
	},

	init: function() {
		this.setKeyboardEnabled(true);
	},

	onKeyDown: function(e){
		var key;

		var map = {};
		map[cc.KEY.up] = "up";
		map[cc.KEY.down] = "down";
		map[cc.KEY.left] = "left";
		map[cc.KEY.right] = "right";

		if(map[e]){
			this._root.game.input(this.player, map[e]);
		}
	},
});