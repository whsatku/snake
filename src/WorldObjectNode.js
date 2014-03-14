/* global cc, GameLogic */
/* jshint unused:false */
"use strict";

window.WorldObjectNode = cc.Sprite.extend({
	init: function(){
		if(arguments.length === 0){
			this._super("res/tiles.png", cc.rect(18, 1, 16, 16));
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