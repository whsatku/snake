/* global cc, GameLogic */
/* jshint unused:false */
"use strict";

window.ObstacleNode = WorldObjectNode.extend({
	tileset: {
		"grass": {
			"#": ["res/tiles.png", cc.rect(80, 16, 16, 16)],
			"T": ["res/tiles.png", cc.rect(96, 48, 16, 16)],
			"D": ["res/tiles.png", cc.rect(64, 176, 16, 16)],
		},
		"brick": {
			"#": ["res/tiles.png", cc.rect(0, 0, 16, 16)],
			"W": ["res/tiles.png", cc.rect(16, 0, 16, 16)]
		},
		"lava": {
			"#": ["res/tiles.png", cc.rect(32, 144, 16, 16)]
		},
		"palace": {
			"#": ["res/tiles.png", cc.rect(0, 0, 16, 16)],
			"W": ["res/tiles.png", cc.rect(16, 0, 16, 16)]
		}
	},

	init: function(){
		var mapName = this.getRoot().game.state.map;
		var tileset = GameLogic.map[mapName].tileset || "brick";
		this._super.apply(this, this.tileset[tileset]["#"]);
		this._setTileType = false;
	},

	syncFromEngine: function(obj){
		this._super(obj);
		if(this._setTileType){
			return;
		}
		var mapName = this.getRoot().game.state.map;
		var tileset = GameLogic.map[mapName].tileset || "brick";
		tileset = this.tileset[tileset];
		this.setTextureRect(tileset[obj.type] !== undefined ? tileset[obj.type][1] : tileset["#"][1]);
		this._setTileType = true;
	},
});