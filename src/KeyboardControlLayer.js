/* global cc */
/* jshint unused:false */
"use strict";

window.KeyboardControlLayer = cc.Layer.extend({
	getScene: function(){
		if(this._scene){
			return this._scene;
		}

		var search = this.getParent();
		while(!(search instanceof GameScene)){
			search = search.getParent();
		}
		this._scene = search;
		return search;
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
			var scene = this.getScene();
			scene.game.input(scene.player, map[e]);
		}
	},
});