/* global cc, GameLogic */
/* jshint unused:false */
"use strict";

window.PowerupNode = WorldObjectNode.extend({
	typeMap: {
		"food": ["res/food.png"],
		"bite": ["res/powerup.png", cc.rect(136, 16, 16, 16)],
	},

	_updatedSprite: false,

	init: function(){
		this._super.apply(this, this.typeMap.food);
	},

	syncFromEngine: function(obj){
		this._super(obj);

		if(obj instanceof GameLogic.PerkPowerup && this._updatedSprite !== true){
			this._updatedSprite = true;
			this.initWithFile.apply(this, this.typeMap[obj.perk] || this.typeMap.food);
		}
	}
});