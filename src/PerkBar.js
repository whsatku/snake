/* global cc, GameLogic */
/* jshint unused:false */
"use strict";

window.PerkBar = cc.SpriteBatchNode.extend({
	perks: [],
	perkMap: {},

	iconMap: {
		"bite": ["res/buff.png", cc.rect(0, 0, 52, 52)],
		"respawn": ["res/buff.png", cc.rect(52, 0, 52, 52)],
		"invert": ["res/buff.png", cc.rect(104, 0, 52, 52)]
	},

	spriteWidth: 52,
	spritePad: 5,

	ctor: function(game){
		this.game = game;
		this._super();
	},

	init: function(){
		this._super("res/buff.png");
		this.setContentSize(this.spriteWidth, this.spriteWidth);
	},

	syncFromEngine: function(obj){
		if(!obj){
			this.perks = [];
		}else{
			this.perks = [];
			for(var perk in obj.perks){
				this.perks.push([perk, obj.perks[perk]]);
			}
		}
		this.updateBar();
	},

	updateBar: function(){
		for(var i = 0; i < this.perks.length; i++){
			var perk = this.perks[i], sprite;
			if(!this.perkMap[perk[0]]){
				sprite = cc.Sprite.create.apply(null, this.iconMap[perk[0]]);
				sprite.setAnchorPoint(0, 0);
				this.perkMap[perk[0]] = sprite;
				this.addChild(sprite);
			}

			sprite = this.perkMap[perk[0]];
			sprite.setPosition(cc.p(i * (this.spriteWidth + this.spritePad), 0));
		}
		for(var perk in this.perkMap){
			var found = false;
			for(var i = 0; i < this.perks.length; i++){
				if(this.perks[i][0] == perk){
					found = true;
					break;
				}
			}
			if(found){
				break;
			}
			var sprite = this.perkMap[perk];
			delete this.perkMap[perk];
			this.removeChild(sprite);
		}
		this.setContentSize((this.spriteWidth + this.spritePad) * this.perks.length, this.spriteWidth);
	},
});