/* global cc, GameLogic */
/* jshint unused:false */
"use strict";

window.WorldObjectNode = cc.Sprite.extend({
	defaultTile: ["res/tiles.png", cc.rect(80, 0, 16, 16)],

	init: function(){
		if(arguments.length === 0){
			this._super.apply(this, this.defaultTile);
		}else{
			this._super.apply(this, arguments);
		}
	},

	syncFromEngine: function(obj){
		this.setPosition(this.getRoot().toUIPosition(obj.x, obj.y));
		this.setVisible(!obj.hidden);
	},

	getRoot: function(){
		if(this._root){
			return this._root;
		}

		var search = this.getParent();
		while(!(search instanceof GameLayer)){
			search = search.getParent();
		}
		this._root = search;
		return search;
	}
});