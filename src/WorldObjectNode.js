/* global cc, GameLogic */
/* jshint unused:false */
"use strict";

window.WorldObjectNode = cc.Sprite.extend({
	tileset: {
		"dungeon": ["res/tiles.png", cc.rect(18, 1, 16, 16)],
		"brick": ["res/tiles.png", cc.rect(69, 1, 16, 16)],
	},

	init: function(){
		if(arguments.length === 0){
			var mapName = this.getScene().map;
			var tileset = GameLogic.map[mapName].tileset || "brick";
			this._super.apply(this, this.tileset[tileset]);
		}else{
			this._super.apply(this, arguments);
		}
	},

	syncFromEngine: function(obj){
		this.setPosition(this.getParent().toUIPosition(obj.x, obj.y));
	},

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
	}
});